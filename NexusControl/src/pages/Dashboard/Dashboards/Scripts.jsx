import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TopBar from '@/components/layout/TopBar';
import ScriptCard from '@/components/scripts/ScriptCard';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddScriptModal from '@/components/scripts/AddScriptModal';
import CommandHistory from '@/components/scripts/CommandHistory';
import CommandPanel from '@/components/scripts/CommandPanel';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['all', 'online', 'offline', 'error', 'idle'];

export default function Scripts() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const {
    data: scripts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['scripts'],
    queryFn: async () => {
      try {
        return await base44.entities.Script.list('-updated_date', 100);
      } catch (err) {
        console.error('Failed to load scripts:', err);
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const filtered = scripts.filter((s) => {
    const matchSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all' || s.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Scripts"
        subtitle="Manage and monitor connected scripts"
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
              placeholder="Search scripts..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-lg">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded capitalize transition-colors',
                  statusFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Add Script */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors glow-primary"
          >
            <Plus className="w-4 h-4" />
            Add Script
          </button>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} script
          {filtered.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </p>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-semibold">
              No scripts found
            </p>

            <p className="text-sm mt-1">
              Add a script to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ScriptCard
                key={s.id}
                script={s}
                onClick={() => navigate(`/scripts/${s.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showAdd && (
        <AddScriptModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);

            qc.invalidateQueries({
              queryKey: ['scripts'],
            });
          }}
        />
      )}
    </div>
  );
}