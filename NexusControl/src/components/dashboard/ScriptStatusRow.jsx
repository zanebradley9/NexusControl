import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  online:  { dot: 'bg-emerald-400 status-pulse-online', label: 'ONLINE',  color: 'text-emerald-400' },
  offline: { dot: 'bg-muted-foreground',                 label: 'OFFLINE', color: 'text-muted-foreground' },
  error:   { dot: 'bg-destructive status-pulse-error',   label: 'ERROR',   color: 'text-destructive' },
  idle:    { dot: 'bg-yellow-400',                       label: 'IDLE',    color: 'text-yellow-400' },
};

// @ts-ignore
export default function ScriptStatusRow({ script, onClick }) {
  // @ts-ignore
  const cfg = statusConfig[script.status] || statusConfig.offline;
  const heartbeat = script.last_heartbeat
    ? formatDistanceToNow(new Date(script.last_heartbeat), { addSuffix: true })
    : 'Never';

  return (
    <div
      onClick={() => onClick?.(script)}
      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-accent/40 cursor-pointer transition-colors group"
    >
      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{script.name}</p>
        <p className="text-xs text-muted-foreground truncate">{script.description || script.group || '—'}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('text-xs font-semibold font-mono-code', cfg.color)}>{cfg.label}</p>
        <p className="text-xs text-muted-foreground">{heartbeat}</p>
      </div>
    </div>
  );
}