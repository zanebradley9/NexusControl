import TopBar from '@/components/layout/TopBar';
import { useState, useEffect } from 'react';
import { Package, RefreshCw, Shield, Bell, Database, Zap, Key, Copy, Check, Trash2, AlertTriangle, Lock, GitBranch, Activity, Cpu, TerminalSquare, Webhook, ShieldCheck, Layers, Radio, BookOpen, Puzzle } from 'lucide-react';
import { MODULES as MODULE_DEFS } from '@/lib/modules.js';
import ModuleConfigs from '@/components/settings/ModuleConfigs';
import { logAudit } from '@/lib/audit-log.js';
import { updateModuleStatus } from '@/lib/modules.js';

const VERSION = '1.0.0';

const statusStyle = {
  active:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  planned: 'text-muted-foreground bg-muted/30 border-border',
  beta:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

function TokenManager() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

 useEffect(() => {
  if (typeof window !== 'undefined') {
    setToken(localStorage.getItem('token') || '');
  }
}, []);

  const save = () => {
    if (!input.trim()) return;
    localStorage.setItem('token', input.trim());
    setToken(input.trim());
    setInput('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

 const copy = async () => {
  try {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(token);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
};

  const masked = token ? token.slice(0, 8) + '••••••••••••••••••••••' + token.slice(-4) : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Key className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Session Token</p>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded border font-mono-code uppercase ${token ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-muted-foreground bg-muted/30 border-border'}`}>
          {token ? 'Stored' : 'Not Set'}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Current Token Display */}
        {token ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Active Token</p>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-4 py-2.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-mono-code text-muted-foreground truncate">{masked}</span>
              <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Token is stored in <code className="text-primary font-mono-code bg-primary/10 px-1 rounded">localStorage</code> and automatically used for all API requests.</p>
          </div>
        ) : (
          <div className="bg-muted/20 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground">
            No token stored. Paste your <code className="text-primary font-mono-code bg-primary/10 px-1 rounded">SESSION_TOKEN</code> from <code className="font-mono-code">/auth/login</code> below.
          </div>
        )}

        {/* Set Token */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{token ? 'Replace Token' : 'Set Token'}</p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Paste SESSION_TOKEN here..."
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono-code text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
            />
            <button
              onClick={save}
              disabled={!input.trim()}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${input.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Usage in Requests</p>
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 border-b border-border bg-muted/20">
              <span className="text-xs text-muted-foreground font-mono-code">javascript</span>
            </div>
            <pre className="px-4 py-3 text-xs font-mono-code text-foreground leading-relaxed overflow-x-auto">{`function getToken() {
  return localStorage.getItem("token");
}

const headers = {
  Authorization: "Bearer " + getToken()
};

// Auto-logout if token is invalid
function logout() {
  localStorage.removeItem("token");
  location.reload();
}`}</pre>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-yellow-400">Security Note</p>
            <p className="text-muted-foreground leading-relaxed">
              <code className="font-mono-code bg-muted px-1 rounded">localStorage</code> is acceptable for MVP / development.
              For production, upgrade to <strong className="text-foreground">httpOnly cookies</strong> or server-side sessions.
              The backend must always validate and reject expired/invalid tokens — never trust the client alone.
            </p>
          </div>
        </div>

        {/* Logout */}
        {token && (
          <div className="pt-1 border-t border-border flex justify-end">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-destructive/70 hover:text-destructive border border-destructive/20 hover:border-destructive/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Token / Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [modules, setModules] = useState(Object.values(MODULE_DEFS));

  useEffect(() => {
    function refresh() {
      setModules(Object.values(MODULE_DEFS));
    }
   return () => {
   if (typeof window !== 'undefined') {
    window.addEventListener("modulesUpdated", refresh);
  }
}}, []);

  const MODULES = modules;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Settings & Updates" subtitle="System configuration and module registry" />

      <main className="flex-1 p-6 space-y-6">
        {/* System Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">ControlHub</p>
              <p className="text-xs text-muted-foreground font-mono-code">v{VERSION} · Core Build</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Up to date
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            {[
              { icon: Package, label: 'Version',      val: VERSION },
              { icon: Shield,  label: 'Build',        val: 'Core' },
              { icon: Database,label: 'Storage',      val: 'Base44 DB' },
              { icon: Bell,    label: 'Notifications', val: 'Visual Only' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />{label}
                </div>
                <p className="text-sm font-semibold text-foreground font-mono-code">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token Manager */}
        <TokenManager />

        {/* Module Registry */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Module Registry</p>
            <span className="ml-auto text-xs text-muted-foreground">{MODULES.filter(m => m.status === 'active').length} active · {MODULES.filter(m => m.status === 'planned').length} planned</span>
          </div>
          <div className="divide-y divide-border/50">
            {MODULES.map((mod) => (
              <div key={mod.name} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{mod.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border font-mono-code uppercase ${
// @ts-ignore
                    statusStyle[mod.status] || statusStyle.planned}`}>
                      {mod.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
                <p className="text-xs font-mono-code text-muted-foreground shrink-0">v{mod.
// @ts-ignore
                version}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">System Architecture</p>
            <span className="ml-auto text-xs text-muted-foreground font-mono-code">lib/</span>
          </div>
          <div className="divide-y divide-border/50">
            {[
              { icon: Key,           file: 'lib/token.js',          color: 'text-primary',     title: 'Token System',       desc: 'getToken · setToken · logout · authHeaders' },
              { icon: ShieldCheck,   file: 'lib/roles.js',          color: 'text-yellow-400',  title: 'Roles & Permissions',desc: 'ROLES · PERMISSIONS · ROLE_PERMISSIONS · hasPermission()' },
              { icon: Lock,          file: 'lib/ui-lock.js',        color: 'text-yellow-400',  title: 'UI Lock',            desc: 'protectUI(user) — hides elements based on role' },
              { icon: TerminalSquare,file: 'lib/api.js',            color: 'text-emerald-400', title: 'Safe API Request',   desc: 'apiRequest() — auto-injects token, logs failures to Discord' },
              { icon: Shield,        file: 'lib/safety.js',         color: 'text-destructive',  title: 'Safety & Error Handler', desc: 'Global JS/Promise crash handler · safeFetch · safeToken · autoRecover' },
              { icon: Activity,      file: 'lib/health.js',         color: 'text-emerald-400', title: 'Health Monitor',     desc: 'startHealthMonitor() — checks /status every 10s, reloads on 3 fails' },
              { icon: Cpu,           file: 'lib/auto-heal.js',      color: 'text-destructive',  title: 'Auto-Heal System',  desc: 'monitorSystem() · triggerRecovery() · startAutoHeal()' },
              { icon: RefreshCw,     file: 'lib/uptime.js',         color: 'text-primary',     title: 'Uptime Logger',      desc: 'logUptime · getUptime · startUptimeMonitor — keeps last 100 entries' },
              { icon: GitBranch,     file: 'lib/scheduler.js',      color: 'text-yellow-400',  title: 'Automation Scheduler', desc: 'addTask · startScheduler — runs commands at scheduled times' },
              { icon: Webhook,       file: 'lib/discord.js',        color: 'text-primary',     title: 'Discord Alerts',     desc: 'sendDiscordLog() — webhook alerts for errors, crashes, offline events' },
              { icon: ShieldCheck,   file: 'lib/api-middleware.js', color: 'text-muted-foreground', title: 'API Middleware', desc: 'validateRequest · authorize — backend request validation & role check' },
              { icon: Zap,           file: 'lib/init.js',           color: 'text-emerald-400', title: 'Boot System',        desc: 'initApp · bootSystem — validates token, locks UI, starts all monitors' },
              { icon: RefreshCw,     file: 'lib/refresh.js',        color: 'text-primary',     title: 'Token Auto-Refresh', desc: 'refreshToken() — POSTs to /api/auth/refresh, retries on 401, auto-logout on fail' },
              { icon: RefreshCw,     file: 'lib/auto-refresh.js',   color: 'text-primary',     title: 'Auto-Refresh Loop',  desc: 'startAutoRefresh() — refreshes token every 10 minutes automatically' },
              { icon: Bell,          file: 'lib/notifications.js',  color: 'text-yellow-400',  title: 'Push Notifications', desc: 'enableNotifications() · pushNotification() — browser push alerts' },
              { icon: Puzzle,        file: 'lib/modules.js',        color: 'text-primary',     title: 'Module Registry',    desc: 'MODULES — central source of truth for all active & planned modules' },
              { icon: ShieldCheck,   file: 'lib/module-access.js',  color: 'text-yellow-400',  title: 'Module Access',      desc: 'getAvailableModules(user) — filters modules by role permission' },
              { icon: BookOpen,      file: 'lib/plan.js',           color: 'text-muted-foreground', title: 'Plan Guard',    desc: 'canUseModule(user, key) — blocks premium modules for non-premium users' },
              { icon: Radio,         file: 'lib/live-logs.js',      color: 'text-emerald-400', title: 'Live Logs WS',       desc: 'startLiveLogs(onLog) — WebSocket subscription with auto-reconnect' },
              { icon: Cpu,           file: 'lib/ai.js',             color: 'text-destructive',  title: 'AI Auto-Detection',  desc: 'analyze(data) · startAIMonitor() — high CPU restart, offline alerts' },
              { icon: BookOpen,      file: 'lib/analytics.js',      color: 'text-muted-foreground', title: 'Analytics',       desc: 'logEvent(name, data) · getAnalytics() — client-side event logging and retrieval' },
              { icon: AlertTriangle, file: 'lib/error-logger.js',   color: 'text-destructive',  title: 'Error Logger',       desc: 'logError(error) — captures and logs JS errors and promise rejections' },
              { icon: TerminalSquare, file: 'lib/script-api.js',     color: 'text-primary',     title: 'Script API',         desc: 'exposeFunction(name, fn) — securely exposes functions to user scripts' },
              { icon: Webhook,       file: 'lib/webhooks.js',       color: 'text-primary',     title: 'Webhook Manager',     desc: 'manageWebhooks() — create, edit, delete webhooks for alerts and integrations' },
              { icon: BookOpen,      file: 'lib/discord.js',        color: 'text-muted-foreground', title: 'AI Stat Card',    desc: 'displayAIStats() — shows real-time AI performance metrics' }
            ].map(({ icon: Icon, file, color, title, desc }) => (
              <div key={file} className="flex items-center gap-4 px-6 py-3.5 hover:bg-accent/20 transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-muted/30 border border-border flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <code className="text-xs font-mono-code text-muted-foreground/60 shrink-0 hidden sm:block">{file}</code>
              </div>
            ))}
          </div>
          {/* Boot flow */}
          <div className="px-6 py-4 border-t border-border bg-muted/10">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Boot Flow</p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-code">
              {['bootSystem()', '→', 'initApp()', '→', 'validateToken', '→', 'protectUI(user)', '→', 'startScheduler()', '→', 'startHealthMonitor()', '→', 'startAutoRefresh()'].map((step, i) => (
                step === '→'
                  ? <span key={i} className="text-muted-foreground/40">{step}</span>
                  : <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{step}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Module Configurations */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Module Configuration</p>
            <span className="ml-auto text-xs text-muted-foreground">Settings persist in localStorage</span>
          </div>
          <div className="p-6">
            <ModuleConfigs 
// @ts-ignore
            activeModuleKeys={modules.filter(m => m.status === 'active').map(m => m.name.toLowerCase().split(' ')[0])} />
          </div>
        </div>

        {/* Upgrade Note */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Expanding this system</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Planned modules (Permissions, Analytics, Automation, etc.) will be added in future updates. 
                This settings page acts as the central registry — new modules will appear here automatically as they're deployed.
                Backend function support (for live script API connections) requires a Builder+ subscription.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}