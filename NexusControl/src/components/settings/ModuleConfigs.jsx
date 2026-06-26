import { useState } from 'react';
import { getModuleConfig, saveModuleConfig } from '@/lib/module-config.js';
import { logAudit } from '@/lib/audit-log.js';
import { Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Per-module config schemas ---
const MODULE_SCHEMAS = {
  api: {
    label: 'API Gateway',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://your-api.com/hook', type: 'text' },
      { key: 'rate_limit', label: 'Rate Limit (req/min)', placeholder: '60', type: 'number' },
      { key: 'timeout_ms', label: 'Timeout (ms)', placeholder: '5000', type: 'number' },
    ],
  },
  automation: {
    label: 'Automation',
    fields: [
      { key: 'default_target', label: 'Default Target', placeholder: 'pc-001', type: 'text' },
      { key: 'poll_interval', label: 'Poll Interval (ms)', placeholder: '5000', type: 'number' },
      { key: 'max_retries', label: 'Max Retries', placeholder: '3', type: 'number' },
    ],
  },
  analytics: {
    label: 'Analytics',
    fields: [
      { key: 'sample_rate', label: 'Sample Rate (ms)', placeholder: '2000', type: 'number' },
      { key: 'history_limit', label: 'History Limit (points)', placeholder: '20', type: 'number' },
    ],
  },
  notifications: {
    label: 'Notifications',
    fields: [
      { key: 'discord_channel', label: 'Discord Channel ID', placeholder: '123456789', type: 'text' },
      { key: 'alert_threshold', label: 'Alert CPU Threshold (%)', placeholder: '90', type: 'number' },
    ],
  },
};

// @ts-ignore
function ModuleConfigForm({ moduleKey, schema }) {
  const [values, setValues] = useState(() => getModuleConfig(moduleKey));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveModuleConfig(moduleKey, values);
    logAudit('system', `Config saved for module: ${moduleKey}`, { module: moduleKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center gap-2">
        <Settings className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">{schema.label} Config</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schema.fields.map(
// @ts-ignore
          field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              <input
                type={field.type}
                value={values[field.key] || ''}
                // @ts-ignore
                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 font-mono-code transition-all"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              saved
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}

// @ts-ignore
export default function ModuleConfigs({ activeModuleKeys = [] }) {
  // @ts-ignore
  const configurable = activeModuleKeys.filter(k => MODULE_SCHEMAS[k]);

  if (configurable.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl px-6 py-8 text-center text-sm text-muted-foreground">
        No active modules with configurable settings. Activate modules to see their configuration here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {configurable.map(key => (
        // @ts-ignore
        <ModuleConfigForm key={key} moduleKey={key} schema={MODULE_SCHEMAS[key]} />
      ))}
    </div>
  );
}