import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TopBar from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RefreshCw, Search, Trash2, Plus, Download } from 'lucide-react';
import AddLogModal from '@/components/activity-logs/AddLogModal';

const LEVELS = ['all', 'info', 'warn', 'error', 'success', 'debug'];

const levelStyle = {
  info:    { badge: 'text-primary bg-primary/10 border-primary/20',         row: '' },
  warn:    { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', row: 'bg-yellow-400/3' },
  error:   { badge: 'text-destructive bg-destructive/10 border-destructive/20', row: 'bg-destructive/3' },
  success: { badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', row: '' },
  debug:   { badge: 'text-muted-foreground bg-muted/30 border-border',       row: 'opacity-70' },
};

export default function Logs() {
  const qc = useQueryClient();
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['logs', 'all'],
    queryFn: () => base44.entities.LogEntry.list('-created_date', 200),
    refetchInterval: 8000,
  });

  const filtered = logs.filter(l => {
    const matchLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchSearch = !search || l.message?.toLowerCase().includes(search.toLowerCase()) || l.script_name?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const clearAll = async () => {
    if (!confirm('Clear all logs? This cannot be undone.')) return;
    await Promise.all(logs.map(l => base44.entities.LogEntry.delete(l.id)));
    qc.invalidateQueries({ queryKey: ['logs'] });
  };

  const exportLogs = () => {
    const content = filtered.map(l =>
      `[${l.created_date ? format(new Date(l.created_date), 'yyyy-MM-dd HH:mm:ss') : ''}] [${l.level?.toUpperCase()}] ${l.script_name ? `[${l.script_name}] ` : ''}${l.message}`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `controlhub-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.log`;
    a.click();
  };

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount  = logs.filter(l => l.level === 'warn').length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Logs" subtitle="Activity log feed from all connected scripts" />

      <main className="flex-1 p-6 space-y-5">
        {/* Summary Row */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',   val: logs.length,  color: 'text-foreground' },
            { label: 'Errors',  val: errorCount,   color: errorCount > 0 ? 'text-destructive' : 'text-muted-foreground' },
            { label: 'Warnings',val: warnCount,    color: warnCount > 0 ? 'text-yellow-400' : 'text-muted-foreground' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={cn('text-lg font-bold font-mono-code', color)}>{val}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-lg">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-semibold rounded capitalize transition-colors',
                  levelFilter === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-2.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportLogs} className="p-2.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Export logs">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" /> Add Log
          </button>
          <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-destructive/30 rounded-lg text-sm text-destructive/70 hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>

        {/* Log Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground text-sm">No log entries found</td>
                  </tr>
                ) : (
                  filtered.map(log => {
                    const s = levelStyle[log.level] || levelStyle.info;
                    return (
                      <tr key={log.id} className={cn('border-b border-border/40 hover:bg-accent/20 transition-colors', s.row)}>
                        <td className="px-4 py-2.5 text-xs font-mono-code text-muted-foreground whitespace-nowrap">
                          {log.created_date ? format(new Date(log.created_date), 'HH:mm:ss') : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn('text-xs font-semibold font-mono-code px-1.5 py-0.5 rounded border uppercase', s.badge)}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono-code whitespace-nowrap">
                          {log.script_name || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-foreground break-words max-w-xl">
                          {log.message}
                          {log.raw_data && <span className="text-muted-foreground ml-2 font-mono-code">{log.raw_data}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showAdd && <AddLogModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ['logs'] }); }} />}
    </div>
  );
}