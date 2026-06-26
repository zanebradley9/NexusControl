import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_';
  for (let i = 0; i < 32; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

export default function AddScriptModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', description: '', group: '', version: '', status: 'offline',
    api_key: generateApiKey(),
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await base44.entities.Script.create({ ...form });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Register New Script</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Script Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Game Monitor" className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="What does this script do?" rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Group">
              <input value={form.group} onChange={e => set('group', e.target.value)} placeholder="e.g. Games" className={inputCls} />
            </Field>
            <Field label="Version">
              <input value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0.0" className={inputCls} />
            </Field>
          </div>
          <Field label="API Key (auto-generated)">
            <div className="flex gap-2">
              <input value={form.api_key} readOnly className={cn(inputCls, 'flex-1 font-mono-code text-xs text-muted-foreground')} />
              <button onClick={() => set('api_key', generateApiKey())} className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Regen
              </button>
            </div>
          </Field>
          <Field label="Initial Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="idle">Idle</option>
            </select>
          </Field>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button
            onClick={save}
            disabled={!form.name.trim() || saving}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-colors',
              form.name.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {saving ? 'Saving...' : 'Register Script'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all';

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}