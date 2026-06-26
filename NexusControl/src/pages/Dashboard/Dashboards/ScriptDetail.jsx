import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TopBar from '@/components/layout/TopBar';
import CommandPanel from '@/components/scripts/CommandPanel';
import CommandHistory from '@/components/scripts/CommandHistory';
import RecentLogs from '@/components/dashboard/RecentLogs';
import { ArrowLeft, Edit2, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

const STATUS = {
  online:  { dot: 'bg-emerald-400 status-pulse-online', badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  offline: { dot: 'bg-muted-foreground',                badge: 'text-muted-foreground bg-muted/30 border-border' },
  error:   { dot: 'bg-destructive status-pulse-error',  badge: 'text-destructive bg-destructive/10 border-destructive/30' },
  idle:    { dot: 'bg-yellow-400',                      badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
};

export default function ScriptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [editStatus, setEditStatus] = useState(false);

  const { data: script, isLoading } = useQuery({
    queryKey: ['script', id],
    queryFn: async () => {
      const all = await base44.entities.Script.list();
      return all.find(s => s.id === id);
    },
    refetchInterval: 8000,
  });

  const { data: commands = [] } = useQuery({
    queryKey: ['commands', id],
    queryFn: () => base44.entities.Command.filter({ script_id: id }, '-created_date', 30),
    refetchInterval: 5000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', id],
    queryFn: () => base44.entities.LogEntry.filter({ script_id: id }, '-created_date', 50),
    refetchInterval: 5000,
  });

  const copyKey = () => {
    navigator.clipboard.writeText(script?.api_key || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (status) => {
    await base44.entities.Script.update(id, { status });
    qc.invalidateQueries({ queryKey: ['script', id] });
    qc.invalidateQueries({ queryKey: ['scripts'] });
    setEditStatus(false);
    if (status === 'error') {
      await base44.entities.Notification.create({
        title: `Script Error: ${script?.name}`,
        message: `Status manually set to ERROR for ${script?.name}`,
        type: 'error',
        source: script?.name,
        script_id: id,
      });
    }
  };

  const deleteScript = async () => {
    if (!confirm('Delete this script? This cannot be undone.')) return;
    await base44.entities.Script.delete(id);
    navigate('/scripts');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Script Detail" />
        <div className="flex-1 p-6 animate-pulse space-y-4">
          <div className="h-32 bg-card border border-border rounded-xl" />
          <div className="h-48 bg-card border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex flex-col min-h-full">
        <TopBar title="Script Not Found" />
        <div className="flex-1 p-6 text-center text-muted-foreground pt-20">
          <p>Script not found.</p>
          <button onClick={() => navigate('/scripts')} className="mt-4 text-primary text-sm">← Back to Scripts</button>
        </div>
      </div>
    );
  }

  const cfg = STATUS[script.status] || STATUS.offline;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title={script.name} subtitle={script.description || 'Script Detail'} />

      <main className="flex-1 p-6 space-y-6">
        {/* Back + Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <button onClick={() => navigate('/scripts')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Scripts
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => qc.invalidateQueries({ queryKey: ['script', id] })} className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={deleteScript} className="p-2 bg-card border border-destructive/30 rounded-lg text-destructive/70 hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            {editStatus ? (
              <div className="flex flex-wrap gap-1.5">
                {['online', 'offline', 'idle', 'error'].map(s => (
                  <button key={s} onClick={() => updateStatus(s)} className={cn('text-xs px-2 py-1 rounded border font-semibold capitalize font-mono-code', STATUS[s].badge)}>
                    {s}
                  </button>
                ))}
                <button onClick={() => setEditStatus(false)} className="text-xs px-2 py-1 text-muted-foreground">cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditStatus(true)}>
                <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                <span className={cn('text-sm font-semibold font-mono-code px-2 py-0.5 rounded border', cfg.badge)}>
                  {script.status?.toUpperCase()}
                </span>
                <Edit2 className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Group</p>
            <p className="text-sm font-medium text-foreground">{script.group || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Version</p>
            <p className="text-sm font-mono-code text-foreground">v{script.version || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Heartbeat</p>
            <p className="text-sm font-mono-code text-foreground">
              {script.last_heartbeat ? format(new Date(script.last_heartbeat), 'MMM d, HH:mm:ss') : 'Never'}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-xs text-muted-foreground mb-1.5">API Key</p>
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 font-mono-code text-xs text-muted-foreground">
              <span className="flex-1 truncate">{script.api_key}</span>
              <button onClick={copyKey} className="text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column: Command + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Command */}
          <div className="lg:col-span-2 space-y-5">
            <CommandPanel script={script} />
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Command History</p>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                <CommandHistory commands={commands} />
              </div>
            </div>
          </div>

          {/* Right: Script Logs */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Script Logs</p>
              <span className="text-xs text-muted-foreground">{logs.length} entries</span>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto">
              <RecentLogs logs={logs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}