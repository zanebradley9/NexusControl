import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Trash2, RefreshCw } from 'lucide-react';

import TopBar from '@/components/layout/TopBar';
import { getAuditLogs, clearAuditLogs } from '@/lib/audit-log.js';
import { cn } from '@/lib/utils';

const TYPE_STYLE = {
  module_status: 'text-primary bg-primary/10 border-primary/20',
  security: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  system: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  command: 'text-muted-foreground bg-muted/30 border-border',
};

const TYPES = [
  'all',
  'module_status',
  'security',
  'system',
  'command',
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = () => {
    try {
      const data = getAuditLogs();

      if (Array.isArray(data)) {
        // @ts-ignore
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== 'undefined') {
      window.addEventListener('auditLogUpdated', load);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auditLogUpdated', load);
      }
    };
  }, []);

  // @ts-ignore
  const filtered = logs.filter((log) => {
    if (!log) return false;

    // @ts-ignore
    const message = log.message || '';
    // @ts-ignore
    const type = log.type || 'command';

    const matchType =
      typeFilter === 'all' || type === typeFilter;

    const matchSearch =
      !search ||
      message.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  const handleClear = () => {
    try {
      const confirmed = window.confirm(
        'Clear all audit logs? This cannot be undone.'
      );

      if (!confirmed) return;

      clearAuditLogs();
      load();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Audit Logs"
        subtitle="Historical record of module changes and system events"
      />

      <main className="flex-1 p-6 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit logs..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-lg">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-semibold rounded capitalize transition-colors',
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'module_status' ? 'module' : t}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={load}
            className="p-2.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-destructive/30 rounded-lg text-sm text-destructive/70 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} entries
        </p>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-border bg-muted/30">

                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">
                    Time
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                    Type
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>

                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-muted-foreground text-sm"
                    >
                      No audit log entries found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log, index) => {
                    const timestamp = log?.timestamp
                      ? new Date(log.timestamp)
                      : new Date();

                    const type = log?.type || 'command';
                    const message = log?.message || 'No message';
                    const meta = log?.meta || {};

                    return (
                      <tr
                        key={log?.id || index}
                        className="border-b border-border/40 hover:bg-accent/20 transition-colors"
                      >

                        <td className="px-4 py-2.5 text-xs font-mono-code text-muted-foreground whitespace-nowrap">
                          {format(timestamp, 'MM/dd HH:mm:ss')}
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              'text-xs font-semibold font-mono-code px-1.5 py-0.5 rounded border uppercase',
                              // @ts-ignore
                              TYPE_STYLE[type] || TYPE_STYLE.command
                            )}
                          >
                            {type === 'module_status' ? 'module' : type}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 text-xs text-foreground">
                          {message}

                          {Object.keys(meta).length > 0 && (
                            <span className="ml-2 text-muted-foreground font-mono-code">
                              {JSON.stringify(meta)}
                            </span>
                          )}
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
    </div>
  );
}