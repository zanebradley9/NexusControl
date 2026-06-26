import { cn } from "@/lib/utils";
import { format } from "date-fns";

const levelStyle = {
  info: "text-primary bg-primary/10",
  warn: "text-yellow-400 bg-yellow-400/10",
  error: "text-destructive bg-destructive/10",
  success: "text-emerald-400 bg-emerald-400/10",
  debug: "text-muted-foreground bg-muted/40",
};

// @ts-ignore
export default function RecentLogs({ logs = [] }) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No recent log entries
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => {
        const level = log?.level || "info";
        const message = log?.message || "";
        const date = log?.created_date
          ? new Date(log.created_date)
          : null;

        return (
          <div
            key={log.id}
            className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-accent/20 transition-colors"
          >
            <span
              className={cn(
                "shrink-0 text-xs font-semibold font-mono-code px-1.5 py-0.5 rounded uppercase",
                // @ts-ignore
                levelStyle[level] || levelStyle.info
              )}
            >
              {level}
            </span>

            <p className="flex-1 text-xs text-foreground leading-relaxed min-w-0 break-words">
              {message}
            </p>

            <span className="shrink-0 text-xs text-muted-foreground font-mono-code whitespace-nowrap">
              {date ? format(date, "HH:mm:ss") : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}