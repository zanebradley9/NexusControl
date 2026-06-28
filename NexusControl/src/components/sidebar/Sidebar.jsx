import { Settings, Zap } from "lucide-react";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";
import { navItems } from "./navItems";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-border bg-card">

      {/* Logo */}
      <div className="border-b border-border px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">

            <Zap className="h-5 w-5 text-primary" />

          </div>

          <div>

            <h1 className="text-lg font-bold">
              ControlHub
            </h1>

            <p className="text-xs text-muted-foreground">
              Mission Control
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">

        <div className="space-y-1">

          {navItems.map((group) => (
            <SidebarGroup
              key={group.label}
              {...group}
            />
          ))}

        </div>

      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3">

        <SidebarItem
          icon={Settings}
          label="Settings"
          path="/settings"
        />

        <div className="mt-4 text-center">

          <p className="text-xs text-muted-foreground">
            NexusControl
          </p>

          <p className="text-[11px] text-muted-foreground">
            v1.0.0
          </p>

        </div>

      </div>

    </aside>
  );
}