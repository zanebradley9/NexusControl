import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef } from 'react';

const icons = {
  error: { Icon: AlertCircle, color: 'text-destructive' },
  warning: { Icon: AlertTriangle, color: 'text-yellow-400' },
  info: { Icon: Info, color: 'text-primary' },
  success: { Icon: CheckCircle, color: 'text-emerald-400' },
};

export default function NotificationPanel({ notifications, onClose }) {
  const qc = useQueryClient();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAllRead = async () => {
    await Promise.all(notifications.map(n => base44.entities.Notification.update(n.id, { read: true })));
    qc.invalidateQueries({ queryKey: ['notifications'] });
    onClose();
  };

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">All caught up!</div>
        ) : (
          notifications.map((n) => {
            const cfg = icons[n.type] || icons.info;
            const { Icon } = cfg;
            return (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors group">
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true }) : ''}
                  </p>
                </div>
                <button onClick={() => markRead(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}