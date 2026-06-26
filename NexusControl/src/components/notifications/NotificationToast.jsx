import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const icons = {
  error: { Icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  warning: { Icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  info: { Icon: Info, color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  success: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);
  const seenIds = useRef(new Set());

  useEffect(() => {
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create') {
        const notif = event.data;
        if (seenIds.current.has(notif.id)) return;
        if (notif.type !== 'error' && notif.type !== 'warning' && notif.type !== 'info') return;
        seenIds.current.add(notif.id);
        const toast = { ...notif, toastId: Date.now() + Math.random() };
        setToasts(prev => [toast, ...prev].slice(0, 5));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.toastId !== toast.toastId));
        }, 6000);
      }
    });
    return unsub;
  }, []);

  const dismiss = (toastId) => setToasts(prev => prev.filter(t => t.toastId !== toastId));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = icons[toast.type] || icons.info;
          const { Icon } = cfg;
          return (
            <motion.div
              key={toast.toastId}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm ${cfg.bg} shadow-2xl`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{toast.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => dismiss(toast.toastId)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
