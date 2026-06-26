import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TopBar from '@/components/layout/TopBar';
import StatusCard from '@/components/dashboard/StatusCard';
import ScriptStatusRow from '@/components/dashboard/ScriptStatusRow';
import RecentLogs from '@/components/dashboard/RecentLogs';
import { Terminal, CheckCircle2, AlertCircle, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: scripts = [] } = useQuery({
    queryKey: ['scripts'],
    queryFn: () => base44.entities.Script.list('-updated_date', 50),
    refetchInterval: 10000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', 'recent'],
    queryFn: () => base44.entities.LogEntry.list('-created_date', 20),
    refetchInterval: 8000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => base44.entities.Notification.filter({ read: false }, '-created_date', 5),
    refetchInterval: 10000,
  });

  const online = scripts.filter(s => s.status === 'online').length;
  const errors = scripts.filter(s => s.status === 'error').length;
  const idle   = scripts.filter(s => s.status === 'idle').length;
  const errorLogs = logs.filter(l => l.level === 'error').length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Dashboard"
        subtitle={`System overview · ${format(new Date(), 'EEEE, MMMM d yyyy')}`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Total Scripts"
            value={scripts.length}
            sub="Registered endpoints"
            icon={Terminal}
            accent="primary"
          />
          <StatusCard
            title="Online"
            value={online}
            sub={`${scripts.length - online} offline`}
            icon={CheckCircle2}
            accent="success"
          />
          <StatusCard
            title="Errors"
            value={errors}
            sub={`${errorLogs} log errors today`}
            icon={AlertCircle}
            accent={errors > 0 ? 'error' : 'muted'}
          />
          <StatusCard
            title="Alerts"
            value={notifications.length}
            sub="Unread notifications"
            icon={Activity}
            accent={notifications.length > 0 ? 'warning' : 'muted'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Script Status */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Script Status</p>
              <button
                onClick={() => navigate('/scripts')}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {scripts.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  No scripts registered yet
                </div>
              ) : (
                scripts.slice(0, 8).map(s => (
                  <ScriptStatusRow
                    key={s.id}
                    script={s}
                    onClick={() => navigate(`/scripts/${s.id}`)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Live Log Feed</p>
              <button
                onClick={() => navigate('/logs')}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Full logs →
              </button>
            </div>
            <div className="p-3">
              <RecentLogs logs={logs} />
            </div>
          </div>
        </div>

        {/* System Info Footer */}
        <div className="bg-card border border-border rounded-xl px-5 py-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last dashboard refresh: <span className="text-foreground font-mono-code">{format(new Date(), 'HH:mm:ss')}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5" />
            <span>Auto-refresh: <span className="text-primary">Every 10s</span></span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">System operational</span>
          </div>
        </div>
      </main>
    </div>
  );
}