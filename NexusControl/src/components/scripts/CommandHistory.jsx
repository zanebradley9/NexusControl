import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, Loader2, Send } from 'lucide-react';

const statusConfig = {
  pending:  { Icon: Clock,        color: 'text-yellow-400' },
  sent:     { Icon: Send,         color: 'text-primary' },
  executed: { Icon: CheckCircle2, color: 'text-emerald-400' },
  failed:   { Icon: XCircle,      color: 'text-destructive' },
};

// @ts-ignore
export default function CommandHistory({ commands = [] }) {
  if (!commands.length) {
    return <div className="py-6 text-center text-muted-foreground text-sm">No commands yet</div>;
  }

  return (
    <div className="space-y-2">
      {commands.map((cmd) => {
        // @ts-ignore
        const cfg = statusConfig[cmd.status] || statusConfig.pending;
        const { Icon } = cfg;
        return (
          <div key={cmd.id} className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg border border-border/50">
            <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', cfg.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-mono-code text-foreground bg-muted px-2 py-0.5 rounded">{cmd.command}</code>
                {cmd.payload && (
                  <code className="text-xs font-mono-code text-muted-foreground truncate max-w-40">{cmd.payload}</code>
                )}
              </div>
              {cmd.response && (
                <p className="text-xs text-muted-foreground mt-1 font-mono-code">→ {cmd.response}</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-1">
                {cmd.created_date ? format(new Date(cmd.created_date), 'MMM d, HH:mm:ss') : ''}
              </p>
            </div>
            <span className={cn('text-xs font-semibold uppercase font-mono-code shrink-0', cfg.color)}>{cmd.status}</span>
          </div>
        );
      })}
    </div>
  );
}