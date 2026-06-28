import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarItem({
  icon: Icon,
  label,
  path,
  level = 0,
}) {
  const location = useLocation();

  const active =
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <Link
      to={path}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
        active
          ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      style={{
        paddingLeft: `${12 + level * 18}px`,
      }}
    >
      {Icon ? (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            active && "text-primary"
          )}
        />
      ) : (
        <div className="w-4" />
      )}

      <span className="flex-1 font-medium truncate">
        {label}
      </span>

      {active && (
        <ChevronRight className="h-4 w-4 text-primary" />
      )}
    </Link>
  );
}