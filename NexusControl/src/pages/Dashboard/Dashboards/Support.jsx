import { LifeBuoy, Bot, Bug, MessageSquare } from 'lucide-react';

export default function Support() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        
        <div className="flex items-center gap-3 mb-6">
          <LifeBuoy className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">
            Support Center
          </h1>
        </div>

        <p className="text-zinc-300 mb-6">
          Need help with NexusControl? Contact support,
          create tickets, or join our Discord server.
        </p>

        <div className="space-y-4">

          {/* Discord Support */}
          <div className="bg-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">
                Discord Support
              </h2>
            </div>

            <p className="text-zinc-400 mb-4">
              Join our Discord server and open a support
              ticket using TicketTool.
            </p>

            <a
              href="https://discord.gg/Argnnqm5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2 rounded-xl font-semibold"
            >
              Join Discord
            </a>
          </div>

          {/* TicketTool */}
          <div className="bg-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">
                Ticket System
              </h2>
            </div>

            <p className="text-zinc-400">
              Use our TicketTool bot in Discord to create
              support tickets for billing, bugs, or account help.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="bg-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">
                AI Assistant
              </h2>
            </div>

            <p className="text-zinc-400">
              Use the NexusControl AI assistant for quick help
              and troubleshooting.
            </p>
          </div>

          {/* Bug Reports */}
          <div className="bg-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">
                Bug Reports
              </h2>
            </div>

            <p className="text-zinc-400">
              Report bugs and technical issues through the
              feedback page or Discord tickets.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}