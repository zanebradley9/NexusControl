import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";

export default function SidebarGroup({
  label,
  icon: Icon,
  children = [],
  level = 0,
}) {
  const location = useLocation();

  // Check if this group contains the active route
  const containsActiveRoute = (items) => {
    return items.some((item) => {
      if (item.children) {
        return containsActiveRoute(item.children);
      }

      return (
        location.pathname === item.path ||
        (item.path !== "/" &&
          location.pathname.startsWith(item.path))
      );
    });
  };

  const [open, setOpen] = useState(
    containsActiveRoute(children)
  );

  useEffect(() => {
    if (containsActiveRoute(children)) {
      setOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="mb-1">

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-accent",
          level > 0 && "ml-2"
        )}
      >
        <div className="flex items-center gap-3">

          {Icon ? (
            <Icon className="w-4 h-4" />
          ) : (
            <div className="w-4" />
          )}

          <span className="font-medium">
            {label}
          </span>

        </div>

        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[3000px]" : "max-h-0"
        )}
      >
        <div className="mt-1 ml-3 border-l border-border pl-2">

          {children.map((item) => {

            // Nested Group
            if (item.children) {
              return (
                <SidebarGroup
                  key={item.label}
                  {...item}
                  level={level + 1}
                />
              );
            }

            return (
              <SidebarItem
                key={item.path}
                {...item}
                level={level + 1}
              />
            );

          })}

        </div>
      </div>

    </div>
  );
}