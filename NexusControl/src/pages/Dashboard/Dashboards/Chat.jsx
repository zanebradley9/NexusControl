import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Hash,
  Shield,
  Crown,
  Terminal,
} from "lucide-react";

import { format } from "date-fns";

import TopBar from "../../../components/layout/TopBar";
import api from "../../../services/api";
import Partnerships from "./Partnerships";

const CHANNELS = {
  public: {
    label: "Public",
    icon: Hash,
    access: ["user", "admin", "owner"],
  },
  admin: {
    label: "Admin",
    icon: Shield,
    access: ["admin", "owner"],
  },
  owner: {
    label: "Owner",
    icon: Crown,
    access: ["owner"],
  },
  Partnerships: {
    label: "Partnerships",
    icon: Crown,
    access: ["partnership", "owner"],
  },
  investing: {
    label: "Investing",
    icon: Crown,
    access: ["investor", "owner"],
  },
};

function MessageBubble({ msg, own }) {
  const isCommand = msg.content?.startsWith("/");

  return (
    <div
      className={`flex gap-3 ${
        own ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] ${
          own
            ? "bg-cyan-500 text-black"
            : "bg-zinc-900 border border-zinc-800 text-white"
        } rounded-2xl px-4 py-3`}
      >
        <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
          <span>{msg.sender_name}</span>

          <span className="px-2 py-0.5 rounded bg-black/20">
            {msg.role}
          </span>

          <span>
            {msg.createdAt
              ? format(new Date(msg.createdAt), "HH:mm")
              : ""}
          </span>
        </div>

        <div className={isCommand ? "font-mono text-xs" : ""}>
          {isCommand && (
            <Terminal className="inline w-3 h-3 mr-1" />
          )}

          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const queryClient = useQueryClient();

  const [channel, setChannel] = useState("public");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const user =
    JSON.parse(localStorage.getItem("user")) || {
      email: "guest@nexuscontrol.ai",
      full_name: "Guest",
      role: "user",
    };

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["chat", channel],
    queryFn: async () => {
      const res = await api.get(`/chat/${channel}`);
      return res.data || [];
    },
    refetchInterval: 3000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending) return;

    try {
      setSending(true);

      const msg = {
        content: input,
        sender_email: user.email,
        sender_name: user.full_name,
        role: user.role,
        channel,
      };

      await api.post("/chat", msg);

      setInput("");

      queryClient.invalidateQueries({
        queryKey: ["chat", channel],
      });

      refetch();
    } catch (err) {
      console.error("Chat send failed:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <TopBar
        title="Mission Chat"
        subtitle="NexusControl communication system"
      />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 gap-4">
        {/* Channels */}
        <div className="flex gap-2">
          {Object.entries(CHANNELS).map(([key, cfg]) => {
            if (!cfg.access.includes(user.role)) return null;

            const Icon = cfg.icon;

            return (
              <button
                key={key}
                onClick={() => setChannel(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                  channel === key
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500">
              No messages yet
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble
                key={index}
                msg={msg}
                own={msg.sender_email === user.email}
              />
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder={`Message #${channel}`}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-400"
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className="px-5 rounded-2xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}