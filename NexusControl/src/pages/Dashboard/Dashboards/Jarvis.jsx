import { useState } from "react";

export default function JarvisPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

const API_URL = import.meta.env.VITE_JARVIS_API

  const sendMessage = async () => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();

      setReply(data.reply);
    } catch (err) {
      console.error(err);
      setReply("Failed to contact Jarvis.");
    }
  };

  return (
    <div>
      <h1>Jarvis Control Panel</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Talk to Jarvis..."
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <p>
        <strong>Jarvis:</strong> {reply}
      </p>
    </div>
  );
}