"""Main JARVIS live assistant runtime."""

import asyncio
import json
import re
import sys
import threading
import traceback
from pathlib import Path
from typing import Any
import sounddevice as sd
from google import genai
from google.genai import types

from memory.memory_manager import (
    format_memory_for_prompt,
    load_memory,
    update_memory,
)
from ui import JarvisUI

from actions.browser_control import browser_control
from actions.code_helper import code_helper
from actions.computer_control import computer_control
from actions.computer_settings import computer_settings
from actions.desktop import desktop_control
from actions.dev_agent import dev_agent
from actions.file_controller import file_controller
from actions.file_processor import file_processor
from actions.flight_finder import flight_finder
from actions.game_updater import game_updater
from actions.open_app import open_app
from actions.reminder import reminder
from actions.screen_processor import screen_process
from actions.send_message import send_message
from actions.weather_report import weather_action
from actions.web_search import web_search as web_search_action
from actions.youtube_video import youtube_video


def get_base_dir() -> Path:
    """Return the application base directory."""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent

    return Path(__file__).resolve().parent


BASE_DIR = get_base_dir()

API_CONFIG_PATH = BASE_DIR / "config" / "api_keys.json"
PROMPT_PATH = BASE_DIR / "core" / "prompt.txt"

LIVE_MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025"

CHANNELS = 1
SEND_SAMPLE_RATE = 16000
RECEIVE_SAMPLE_RATE = 24000
CHUNK_SIZE = 1024

_CTRL_RE = re.compile(r"<ctrl\d+>", re.IGNORECASE)


def _get_api_key() -> str:
    """Load Gemini API key."""
    with open(API_CONFIG_PATH, "r", encoding="utf-8") as file:
        return json.load(file)["gemini_api_key"]


def _load_system_prompt() -> str:
    """Load the system prompt from disk."""
    try:
        return PROMPT_PATH.read_text(encoding="utf-8")

    except OSError:
        return (
            "You are JARVIS, Tony Stark's AI assistant. "
            "Be concise, direct, and always use the provided tools "
            "to complete tasks. Never simulate or guess results — "
            "always call the appropriate tool."
        )


def _clean_transcript(text: str) -> str:
    """Remove control characters from transcript."""
    text = _CTRL_RE.sub("", text)
    text = re.sub(r"[\x00-\x08\x0b-\x1f]", "", text)

    return text.strip()


TOOL_DECLARATIONS = []


class JarvisLive:
    """Realtime JARVIS voice assistant."""

    def __init__(self, ui: JarvisUI):
        self.ui = ui

        self.session = None
        self.audio_in_queue = None
        self.out_queue = None

        self._loop = None
        self._is_speaking = False
        self._speaking_lock = threading.Lock()

        self._turn_done_event: asyncio.Event | None = None

        self.ui.on_text_command = self._on_text_command

    def _on_text_command(self, text: str) -> None:
        """Handle text commands from UI."""
        if not self._loop or not self.session:
            return

        asyncio.run_coroutine_threadsafe(
            self.session.send_client_content(
                turns={"parts": [{"text": text}]},
                turn_complete=True,
            ),
            self._loop,
        )

    def set_speaking(self, value: bool) -> None:
        """Update speaking state."""
        with self._speaking_lock:
            self._is_speaking = value

        if value:
            self.ui.set_state("SPEAKING")

        elif not self.ui.muted:
            self.ui.set_state("LISTENING")

    def speak(self, text: str) -> None:
        """Send speech text to the live session."""
        if not self._loop or not self.session:
            return

        asyncio.run_coroutine_threadsafe(
            self.session.send_client_content(
                turns={"parts": [{"text": text}]},
                turn_complete=True,
            ),
            self._loop,
        )

    def speak_error(self, tool_name: str, error: Exception) -> None:
        """Speak tool execution errors."""
        short_error = str(error)[:120]

        self.ui.write_log(f"ERR: {tool_name} — {short_error}")

        self.speak(
            f"Sir, {tool_name} encountered an error. "
            f"{short_error}"
        )

    def _build_config(self) -> types.LiveConnectConfig:
        """Build Gemini live configuration."""
        from datetime import datetime

        memory = load_memory()
        memory_prompt = format_memory_for_prompt(memory)

        system_prompt = _load_system_prompt()

        now = datetime.now()

        time_str = now.strftime(
            "%A, %B %d, %Y — %I:%M %p"
        )

        time_context = (
            "[CURRENT DATE & TIME]\n"
            f"Right now it is: {time_str}\n"
            "Use this to calculate exact times "
            "for reminders.\n\n"
        )

        parts = [time_context]

        if memory_prompt:
            parts.append(memory_prompt)

        parts.append(system_prompt)

        return types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            output_audio_transcription={},
            input_audio_transcription={},
            system_instruction="\n".join(parts),
            tools=[
                {
                    "function_declarations": TOOL_DECLARATIONS,
                }
            ],
            session_resumption=types.SessionResumptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=(
                        types.PrebuiltVoiceConfig(
                            voice_name="Charon"
                        )
                    )
                )
            ),
        )

    async def _execute_tool(
        self,
        fc: Any,
    ) -> types.FunctionResponse:
        """Execute a tool call."""
        name = fc.name
        args = dict(fc.args or {})

        print(f"[JARVIS]  {name} {args}")

        self.ui.set_state("THINKING")

        if name == "save_memory":
            category = args.get("category", "notes")
            key = args.get("key", "")
            value = args.get("value", "")

            if key and value:
                update_memory(
                    {
                        category: {
                            key: {
                                "value": value,
                            }
                        }
                    }
                )

                print(
                    f"[Memory]  {category}/{key} = {value}"
                )

            if not self.ui.muted:
                self.ui.set_state("LISTENING")

            return types.FunctionResponse(
                id=fc.id,
                name=name,
                response={
                    "result": "ok",
                    "silent": True,
                },
            )

        loop = asyncio.get_running_loop()

        result = "Done."

        try:
            if name == "open_app":
                result = await loop.run_in_executor(
                    None,
                    lambda: open_app(
                        parameters=args,
                        response=None,
                        player=self.ui,
                    ),
                )

            elif name == "weather_report":
                result = await loop.run_in_executor(
                    None,
                    lambda: weather_action(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "browser_control":
                result = await loop.run_in_executor(
                    None,
                    lambda: browser_control(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "file_controller":
                result = await loop.run_in_executor(
                    None,
                    lambda: file_controller(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "send_message":
                result = await loop.run_in_executor(
                    None,
                    lambda: send_message(
                        parameters=args,
                        response=None,
                        player=self.ui,
                        session_memory=None,
                    ),
                )

            elif name == "reminder":
                result = await loop.run_in_executor(
                    None,
                    lambda: reminder(
                        parameters=args,
                        response=None,
                        player=self.ui,
                    ),
                )

            elif name == "youtube_video":
                result = await loop.run_in_executor(
                    None,
                    lambda: youtube_video(
                        parameters=args,
                        response=None,
                        player=self.ui,
                    ),
                )

            elif name == "screen_process":
                threading.Thread(
                    target=screen_process,
                    kwargs={
                        "parameters": args,
                        "response": None,
                        "player": self.ui,
                        "session_memory": None,
                    },
                    daemon=True,
                ).start()

                result = (
                    "Vision module activated."
                )

            elif name == "computer_settings":
                result = await loop.run_in_executor(
                    None,
                    lambda: computer_settings(
                        parameters=args,
                        response=None,
                        player=self.ui,
                    ),
                )

            elif name == "desktop_control":
                result = await loop.run_in_executor(
                    None,
                    lambda: desktop_control(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "code_helper":
                result = await loop.run_in_executor(
                    None,
                    lambda: code_helper(
                        parameters=args,
                        player=self.ui,
                        speak=self.speak,
                    ),
                )

            elif name == "dev_agent":
                result = await loop.run_in_executor(
                    None,
                    lambda: dev_agent(
                        parameters=args,
                        player=self.ui,
                        speak=self.speak,
                    ),
                )

            elif name == "web_search":
                result = await loop.run_in_executor(
                    None,
                    lambda: web_search_action(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "file_processor":
                if (
                    not args.get("file_path")
                    and self.ui.current_file
                ):
                    args["file_path"] = (
                        self.ui.current_file
                    )

                result = await loop.run_in_executor(
                    None,
                    lambda: file_processor(
                        parameters=args,
                        player=self.ui,
                        speak=self.speak,
                    ),
                )

            elif name == "computer_control":
                result = await loop.run_in_executor(
                    None,
                    lambda: computer_control(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "game_updater":
                result = await loop.run_in_executor(
                    None,
                    lambda: game_updater(
                        parameters=args,
                        player=self.ui,
                        speak=self.speak,
                    ),
                )

            elif name == "flight_finder":
                result = await loop.run_in_executor(
                    None,
                    lambda: flight_finder(
                        parameters=args,
                        player=self.ui,
                    ),
                )

            elif name == "shutdown_jarvis":
                self.ui.write_log(
                    "SYS: Shutdown requested."
                )

                self.speak("Goodbye, sir.")

                def _shutdown() -> None:
                    import os
                    import time

                    time.sleep(1)

                    os._exit(0)

                threading.Thread(
                    target=_shutdown,
                    daemon=True,
                ).start()

                result = "Shutting down."

            else:
                result = f"Unknown tool: {name}"

        except Exception as error:  # pylint: disable=broad-exception-caught
            result = (
                f"Tool '{name}' failed: {error}"
            )

            traceback.print_exc()

            self.speak_error(name, error)

        if not self.ui.muted:
            self.ui.set_state("LISTENING")

        print(
            f"[JARVIS] {name} → "
            f"{str(result)[:80]}"
        )

        return types.FunctionResponse(
            id=fc.id,
            name=name,
            response={
                "result": result or "Done.",
            },
        )

    async def _send_realtime(self) -> None:
        """Send realtime audio to Gemini."""
        while True:
            message = await self.out_queue.get()

            await self.session.send_realtime_input(
                media=message
            )

    async def _listen_audio(self) -> None:
        """Listen to microphone audio."""
        print("[JARVIS]  Mic started")

        loop = asyncio.get_running_loop()

        def callback(
            indata,
            _frames,
            _time_info,
            _status,
        ) -> None:
            with self._speaking_lock:
                jarvis_speaking = self._is_speaking

            if (
                not jarvis_speaking
                and not self.ui.muted
            ):
                audio_data = indata.tobytes()

                loop.call_soon_threadsafe(
                    self.out_queue.put_nowait,
                    {
                        "data": audio_data,
                        "mime_type": "audio/pcm",
                    },
                )

        try:
            with sd.InputStream(
                samplerate=SEND_SAMPLE_RATE,
                channels=CHANNELS,
                dtype="int16",
                blocksize=CHUNK_SIZE,
                callback=callback,
            ):
                print("[JARVIS]  Stream open")

                await asyncio.Event().wait()

        except Exception as error:  # pylint: disable=broad-exception-caught
            print(f"[JARVIS] Mic error: {error}")

            raise

    async def _receive_audio(self) -> None:
        """Receive audio and responses."""
        print("[JARVIS]  Receiving")

        output_buffer = []
        input_buffer = []

        try:
            while True:
                async for response in self.session.receive():

                    if response.data:
                        if (
                            self._turn_done_event
                            and self._turn_done_event.is_set()
                        ):
                            self._turn_done_event.clear()

                        self.audio_in_queue.put_nowait(
                            response.data
                        )

                    if response.server_content:
                        server_content = (
                            response.server_content
                        )

                        if (
                            server_content.output_transcription
                            and server_content
                            .output_transcription.text
                        ):
                            text = _clean_transcript(
                                server_content
                                .output_transcription.text
                            )

                            if text:
                                output_buffer.append(text)

                        if (
                            server_content.input_transcription
                            and server_content
                            .input_transcription.text
                        ):
                            text = _clean_transcript(
                                server_content
                                .input_transcription.text
                            )

                            if text:
                                input_buffer.append(text)

                        if server_content.turn_complete:
                            if self._turn_done_event:
                                self._turn_done_event.set()

                            full_input = " ".join(
                                input_buffer
                            ).strip()

                            if full_input:
                                self.ui.write_log(
                                    f"You: {full_input}"
                                )

                            input_buffer = []

                            full_output = " ".join(
                                output_buffer
                            ).strip()

                            if full_output:
                                self.ui.write_log(
                                    f"Jarvis: {full_output}"
                                )

                            output_buffer = []

                    if response.tool_call:
                        function_responses = []

                        for function_call in (
                            response.tool_call.function_calls
                        ):
                            print(
                                f"[JARVIS]  "
                                f"{function_call.name}"
                            )

                            function_response = (
                                await self._execute_tool(
                                    function_call
                                )
                            )

                            function_responses.append(
                                function_response
                            )

                        await self.session.send_tool_response(
                            function_responses=(
                                function_responses
                            )
                        )

        except Exception as error:  # pylint: disable=broad-exception-caught
            print(f"[JARVIS] Receive error: {error}")

            traceback.print_exc()

            raise

    async def _play_audio(self) -> None:
        """Play Gemini audio output."""
        print("[JARVIS]  Audio output started")

        stream = sd.RawOutputStream(
            samplerate=RECEIVE_SAMPLE_RATE,
            channels=CHANNELS,
            dtype="int16",
            blocksize=CHUNK_SIZE,
        )

        stream.start()

        try:
            while True:
                try:
                    chunk = await asyncio.wait_for(
                        self.audio_in_queue.get(),
                        timeout=0.1,
                    )

                except asyncio.TimeoutError:
                    if (
                        self._turn_done_event
                        and self._turn_done_event.is_set()
                        and self.audio_in_queue.empty()
                    ):
                        self.set_speaking(False)

                        self._turn_done_event.clear()

                    continue

                self.set_speaking(True)

                await asyncio.to_thread(
                    stream.write,
                    chunk,
                )

        finally:
            self.set_speaking(False)

            stream.stop()
            stream.close()

    async def run(self) -> None:
        """Run JARVIS."""
        client = genai.Client(
            api_key=_get_api_key(),
            http_options={
                "api_version": "v1beta",
            },
        )

        while True:
            try:
                print("[JARVIS]  Connecting")

                self.ui.set_state("THINKING")

                config = self._build_config()

                async with (
                    client.aio.live.connect(
                        model=LIVE_MODEL,
                        config=config,
                    ) as session,
                    asyncio.TaskGroup() as task_group,
                ):
                    self.session = session

                    self._loop = (
                        asyncio.get_running_loop()
                    )

                    self.audio_in_queue = (
                        asyncio.Queue()
                    )

                    self.out_queue = asyncio.Queue(
                        maxsize=10
                    )

                    self._turn_done_event = (
                        asyncio.Event()
                    )

                    print("[JARVIS]  Connected")

                    self.ui.set_state("LISTENING")

                    self.ui.write_log(
                        "SYS: JARVIS online."
                    )

                    task_group.create_task(
                        self._send_realtime()
                    )

                    task_group.create_task(
                        self._listen_audio()
                    )

                    task_group.create_task(
                        self._receive_audio()
                    )

                    task_group.create_task(
                        self._play_audio()
                    )

            except Exception as error:  # pylint: disable=broad-exception-caught
                print(f"[JARVIS] {error}")

                traceback.print_exc()

            self.set_speaking(False)

            self.ui.set_state("THINKING")

            print(
                "[JARVIS]  Reconnecting in 3s"
            )

            await asyncio.sleep(3)


def main() -> None:
    """Application entry point."""
    ui = JarvisUI("face.png")

    def runner() -> None:
        ui.wait_for_api_key()

        jarvis = JarvisLive(ui)

        try:
            asyncio.run(jarvis.run())

        except KeyboardInterrupt:
            print("\n Shutting down")

    threading.Thread(
        target=runner,
        daemon=True,
    ).start()

    ui.root.mainloop()


if __name__ == "__main__":
    main()