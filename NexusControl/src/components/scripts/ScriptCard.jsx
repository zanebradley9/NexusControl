import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Terminal, ChevronRight, Tag } from 'lucide-react';

const statusConfig = {
  online:  { dot: 'bg-emerald-400 status-pulse-online', label: 'ONLINE',  badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  offline: { dot: 'bg-muted-foreground',                 label: 'OFFLINE', badge: 'text-muted-foreground bg-muted/30 border-border' },
  error:   { dot: 'bg-destructive status-pulse-error',   label: 'ERROR',   badge: 'text-destructive bg-destructive/10 border-destructive/30' },
  idle:    { dot: 'bg-yellow-400',                       label: 'IDLE',    badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
};

// @ts-ignore
export default function ScriptCard({ script, onClick }) {
  // @ts-ignore
  const cfg = statusConfig[script.status] || statusConfig.offline;

  return (
    <div
      onClick={() => onClick?.(script)}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 cursor-pointer transition-all group hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{script.name}</p>
            {script.version && <p className="text-xs text-muted-foreground font-mono-code">v{script.version}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
          <span className={cn('text-xs font-semibold font-mono-code px-2 py-0.5 rounded border', cfg.badge)}>{cfg.label}</span>
        </div>
      </div>

      {script.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{script.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {script.group && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              <Tag className="w-2.5 h-2.5" />{script.group}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          <span>
            {script.last_heartbeat
              ? formatDistanceToNow(new Date(script.last_heartbeat), { addSuffix: true })
              : 'Never'}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}