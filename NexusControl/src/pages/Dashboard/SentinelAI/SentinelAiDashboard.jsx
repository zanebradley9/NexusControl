import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Eye, Zap, Activity, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import SeverityBadge from '@/components/incidents/SeverityBadge';
import StatusBadge from '@/components/incidents/StatusBadge';
import moment from 'moment';

const SEVERITY_COLORS = {
  low: '#3b82f6',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const data = await base44.entities.Incident.list('-created_date', 100);
    setIncidents(data);
    setLoading(false);
    if (data.length > 0) generateAiSummary(data);
  };

  const generateAiSummary = async (data) => {
    setSummaryLoading(true);
    const summary = data.map(i =>
      `[${i.severity.toUpperCase()}] ${i.title} (${i.type}, ${i.status})`
    ).join('\n');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a security operations AI. Analyze these recent incidents and provide a concise 2-3 sentence executive threat summary with key patterns and recommended priorities:\n\n${summary}`,
    });
    setAiSummary(res);
    setSummaryLoading(false);
  };

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  // Last 7 days trend
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const day = moment().subtract(6 - i, 'days');
    const count = incidents.filter(inc =>
      moment(inc.created_date).isSame(day, 'day')
    ).length;
    return { day: day.format('ddd'), count };
  });

  // Severity distribution
  const severityData = ['low', 'medium', 'high', 'critical'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: incidents.filter(i => i.severity === s).length,
    color: SEVERITY_COLORS[s],
  })).filter(d => d.value > 0);

  // Type distribution
  const typeMap = {};
  incidents.forEach(i => { typeMap[i.type] = (typeMap[i.type] || 0) + 1; });
  const typeData = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
    }));

  const recentCritical = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 5);

  const statCards = [
    { label: 'Total Incidents', value: stats.total, icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Critical', value: stats.critical, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading threat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Security Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time threat overview and analytics</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-muted-foreground">LAST UPDATED</p>
          <p className="text-xs font-mono text-primary">{moment().format('HH:mm:ss')}</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-card border border-primary/20 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-mono text-primary font-semibold tracking-wider mb-1">AI THREAT SUMMARY</p>
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono">Analyzing threat landscape...</span>
              </div>
            ) : aiSummary ? (
              <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No incidents to analyze yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">7-Day Incident Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199,89%,48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199,89%,48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(199,89%,48%)" fill="url(#areaGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Severity Breakdown</h2>
          </div>
          {severityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {severityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {severityData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name}: <span className="font-mono font-semibold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Type distribution + recent critical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Type bar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Top Incident Types</h2>
          </div>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(199,89%,48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data</div>
          )}
        </div>

        {/* Recent critical */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-foreground">High Priority Incidents</h2>
            </div>
            <Link to="/incidents" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentCritical.length > 0 ? (
            <div className="space-y-3">
              {recentCritical.map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="block group">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <SeverityBadge severity={inc.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{inc.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{moment(inc.created_date).fromNow()}</p>
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No high-priority incidents</div>
          )}
        </div>
      </div>
    </div>
  );
}