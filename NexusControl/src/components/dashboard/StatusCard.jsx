import { cn } from '@/lib/utils';

// @ts-ignore
export default function StatusCard({ title, value, sub, icon: Icon, accent = 'primary', trend }) {
  const accentMap = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    error: 'text-destructive border-destructive/20 bg-destructive/5',
    warning: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
    success: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    muted: 'text-muted-foreground border-border bg-card',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', 
// @ts-ignore
          accentMap[accent])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={trend >= 0 ? 'text-emerald-400' : 'text-destructive'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      )}
    </div>
  );
}