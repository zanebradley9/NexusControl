import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Terminal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COMMANDS = ['ping', 'status', 'restart', 'stop', 'reload', 'info', 'health'];

// @ts-ignore
export default function CommandPanel({ script }) {
  const [command, setCommand] = useState('');
  const [payload, setPayload] = useState('');
  const [sending, setSending] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const qc = useQueryClient();

  const send = async () => {
    if (!command.trim()) return;
    setSending(true);
    await base44.entities.Command.create({
      script_id: script.id,
      script_name: script.name,
      command: command.trim(),
      payload: payload.trim() || undefined,
      status: 'pending',
    });
    await base44.entities.LogEntry.create({
      script_id: script.id,
      script_name: script.name,
      level: 'info',
      message: `Command sent: ${command.trim()}${payload ? ` | payload: ${payload}` : ''}`,
      category: 'command',
    });
    setCommand('');
    setPayload('');
    setSending(false);
    qc.invalidateQueries({ queryKey: ['commands'] });
    qc.invalidateQueries({ queryKey: ['logs'] });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Terminal className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Send Command</p>
        <span className="ml-auto text-xs text-muted-foreground font-mono-code">{script.name}</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Command Input */}
        <div className="relative">
          <input
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Enter command..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 pr-10 text-sm font-mono-code text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
          />
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', showPresets && 'rotate-180')} />
          </button>
          {showPresets && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-2xl">
              {PRESET_COMMANDS.map(cmd => (
                <button
                  key={cmd}
                  onClick={() => { setCommand(cmd); setShowPresets(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-mono-code text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Payload */}
        <textarea
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder="Payload (optional JSON or text)..."
          rows={2}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono-code text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all resize-none"
        />
        <button
          onClick={send}
          disabled={!command.trim() || sending}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
            command.trim() && !sending
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-primary'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Send Command'}
        </button>
      </div>
    </div>
  );
}