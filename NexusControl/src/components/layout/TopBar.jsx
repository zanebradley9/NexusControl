import { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { format } from 'date-fns';

export default function TopBar({ title = "", subtitle = "" }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Notifications fetch
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        // ✅ FIX: replace with your real backend endpoint
        const res = await fetch('/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) return [];

        const json = await res.json();
        return json?.data || json || [];
      } catch (err) {
        console.error('Notifications fetch error:', err);
        return [];
      }
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">

      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Last Updated */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="w-4 h-4" />
          <span>
            Updated {format(lastUpdated, 'HH:mm:ss')}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Bell className="w-4 h-4" />

            {/* Badge */}
            {notifications?.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Panel */}
          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

      </div>
    </header>
  );
}