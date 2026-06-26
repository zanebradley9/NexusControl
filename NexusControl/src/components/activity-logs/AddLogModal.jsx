import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all";

// @ts-ignore
export default function AddLogModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    level: "info",
    message: "",
    script_name: "",
    raw_data: "",
  });

  const [saving, setSaving] = useState(false);

  // @ts-ignore
  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.message.trim()) return;

    setSaving(true);

    try {
      await base44.entities.LogEntry.create({
        ...form,
      });

      if (form.level === "error") {
        await base44.entities.Notification.create({
          title: "New Error Log",
          message: form.message.trim().slice(0, 120),
          type: "error",
          source: form.script_name || "Manual",
        });
      }

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to save log:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Add Log Entry</p>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Level
            </label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className={inputCls}
            >
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Source / Script Name
            </label>
            <input
              value={form.script_name}
              onChange={(e) => set("script_name", e.target.value)}
              placeholder="e.g. GameMonitor"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Message *
            </label>
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Log message..."
              rows={3}
              className={cn(inputCls, "resize-none")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Raw Data (optional)
            </label>
            <input
              value={form.raw_data}
              onChange={(e) => set("raw_data", e.target.value)}
              placeholder="Additional data..."
              className={cn(inputCls, "font-mono-code text-xs")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={!form.message.trim() || saving}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-colors",
              form.message.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? "Saving..." : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}