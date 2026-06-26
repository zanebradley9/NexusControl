import { useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';

export default function AIIntegrations() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am the NexusControl AI assistant. How can I help you today?',
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Fake AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `AI Response: You said "${message}"`,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1200);

    setMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-8 h-8 text-cyan-400" />

          <div>
            <h1 className="text-3xl font-bold">
              NexusControl AI
            </h1>

            <p className="text-zinc-400 text-sm">
              AI integrations and assistant dashboard
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-[500px] overflow-y-auto">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-cyan-400 text-black'
                    : 'bg-zinc-800 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="Ask the AI something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleSend()
            }
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black px-5 rounded-xl flex items-center gap-2 font-semibold transition-all"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}