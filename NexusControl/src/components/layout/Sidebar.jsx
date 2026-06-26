import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  ScrollText,
  Settings,
  Zap,
  ChevronRight,
  BookOpen,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  Handshake
} from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Terminal, label: 'Scripts', path: '/scripts' },
  { icon: ScrollText, label: 'Logs', path: '/logs' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: ClipboardList, label: 'AuditLogs', path: '/audit-logs' },
  { icon: ShieldCheck, label: 'Permissions', path: '/permissions' },
  { icon: Handshake, label: 'Partnerships', path: '/partnerships' },
  { icon: BookOpen, label: 'API Docs', path: '/api-docs' },
  { icon: Zap, label: 'Subscription', path: '/subscription' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
  { icon: BookOpen, label: 'AI Integrations', path: '/ai-integrations' },
  { icon: ShieldCheck, label: 'Support', path: '/support' },
  { icon: Handshake, label: 'Contact', path: '/contact' },
  { icon: LayoutDashboard, label: 'About', path: '/about' },
  { icon: Terminal, label: 'Jarvis Chat', path: '/jarvis' },
  { icon: ClipboardList, label: 'Game Store', path: '/gamestore' },
  { icon: ClipboardList, label: 'Game Store - Guns', path: '/gamestore/guns' },
  { icon: ClipboardList, label: 'Game Store - Cars', path: '/gamestore/cars' },
  { icon: BookOpen, label: 'Dashboard Code', path: '/dashboardcode' },
  {icon: BookOpen, label: 'Create Skills 3D', path: '/gamestore/createskills3d' },
  {icon: BookOpen, label: 'BookNook Studio', path: '/booknookstudio'},
  {icon: BookOpen, label: 'BookNook Studio - Admin', path: '/booknookstudio/admin'},
  {icon: BookOpen, label: 'BookNook Studio - Admin Reporting', path: '/booknookstudio/adminreporting'},
  {icon: BookOpen, label: 'BookNook Studio - Analytics', path: '/booknookstudio/analytics'},
  {icon: BookOpen, label: 'BookNook Studio - Book Reviews', path: '/booknookstudio/book-reviews'},
  {icon: BookOpen, label: 'BookNook Studio - Settings', path: '/booknookstudio/settings'},
  {icon: BookOpen, label: 'BookNook Studio - Community', path: '/booknookstudio/community'},
  {icon: BookOpen, label: 'BookNook Studio - Dashboard', path: '/booknookstudio/dashboard'},
  {icon: BookOpen, label: 'BookNook Studio - Earnings', path: '/booknookstudio/earnings'},
  {icon: BookOpen, label: 'BookNook Studio - Events', path: '/booknookstudio/events'},
  {icon: BookOpen, label: 'BookNook Studio - Manage Events', path: '/booknookstudio/manage-events'},
  {icon: BookOpen, label: 'BookNook Studio - Home', path: '/booknookstudio/home'},
  {icon: BookOpen, label: 'BookNook Studio - Library', path: '/booknookstudio/library'},
  {icon: BookOpen, label: 'BookNook Studio - Orders', path: '/booknookstudio/orders'},
  {icon: BookOpen, label: 'BookNook Studio - Profile', path: '/booknookstudio/profile'},
  {icon: BookOpen, label: 'BookNook Studio - Promotions', path: '/booknookstudio/promotions'},
  {icon: BookOpen, label: 'BookNook Studio - Read Book', path: '/booknookstudio/readbook'},
  {icon: BookOpen, label: 'BookNook Studio - Showcase', path: '/booknookstudio/showcase'},
  {icon: BookOpen, label: 'BookNook Studio - Tools', path: '/booknookstudio/tools'},
  {icon: BookOpen, label: 'BookNook Studio - Write', path: '/booknookstudio/write'},
];
const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-border bg-card z-40">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">ControlHub</p>
          <p className="text-xs text-muted-foreground mt-0.5">Mission Control</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
          Core
        </p>

        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                active
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary' : '')} />
              <span className="font-medium">{label}</span>

              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        {bottomItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}

        <div className="px-3 pt-3">
          <p className="text-xs text-muted-foreground font-mono-code">v1.0.0-core</p>
        </div>
      </div>
    </aside>
  );
}