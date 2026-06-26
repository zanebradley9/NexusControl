import TopBar from '@/components/layout/TopBar';
import { useState } from 'react';

import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  // @ts-ignore
  Terminal,
  // @ts-ignore
  ScrollText,
  // @ts-ignore
  Activity,
  // @ts-ignore
  RefreshCw,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const BASE_URL = 'https://positive-nexus-command-core.base44.app/api';

/* ---------------- COPY BUTTON ---------------- */

// @ts-ignore
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (!navigator?.clipboard || !text) return;

      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy code"
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/* ---------------- CODE BLOCK ---------------- */

// @ts-ignore
function CodeBlock({ code, lang = 'json' }) {
  return (
    <div className="relative group bg-background border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
        <span className="text-xs text-muted-foreground font-mono-code">
          {lang}
        </span>

        <CopyButton text={code} />
      </div>

      <pre className="px-4 py-3 text-xs font-mono-code text-foreground overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

/* ---------------- METHOD BADGE ---------------- */

// @ts-ignore
function MethodBadge({ method }) {
  const colors = {
    GET: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    POST: 'text-primary bg-primary/10 border-primary/30',
    PUT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    DELETE: 'text-destructive bg-destructive/10 border-destructive/30',
  };

  return (
    <span
      className={cn(
        'text-xs font-bold font-mono-code px-2 py-0.5 rounded border',
        // @ts-ignore
        colors[method] || colors.GET
      )}
    >
      {method || 'GET'}
    </span>
  );
}

/* ---------------- ENDPOINT ---------------- */

function Endpoint({
  // @ts-ignore
  method,
  // @ts-ignore
  path,
  // @ts-ignore
  title,
  // @ts-ignore
  description,
  // @ts-ignore
  body,
  // @ts-ignore
  response,
  // @ts-ignore
  params,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-card hover:bg-accent/20 transition-colors text-left"
      >
        <MethodBadge method={method} />

        <code className="text-sm font-mono-code text-foreground flex-1 break-all">
          {path}
        </code>

        <span className="text-xs text-muted-foreground hidden sm:block">
          {title}
        </span>

        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 py-4 bg-card/50 border-t border-border space-y-4">
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {params && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Query Params
              </p>

              <CodeBlock code={params} lang="query" />
            </div>
          )}

          {body && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Request Body
              </p>

              <CodeBlock code={body} lang="json" />
            </div>
          )}

          {response && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Response
              </p>

              <CodeBlock code={response} lang="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- SECTION ---------------- */

function Section({
  // @ts-ignore
  icon: Icon,
  // @ts-ignore
  title,
  color = 'text-primary',
  // @ts-ignore
  children,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border">
        <Icon className={cn('w-5 h-5', color)} />

        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function ApiDocs() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="API Documentation"
        subtitle="Connect your scripts and systems to ControlHub"
      />

      <main className="flex-1 p-6 space-y-8 max-w-4xl">

        {/* Base URL */}
        <div className="bg-card border border-primary/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />

            <p className="text-sm font-semibold text-foreground">
              Base URL
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background rounded-lg px-4 py-2.5 border border-border font-mono-code text-sm text-primary">
            <span className="flex-1 break-all">
              {BASE_URL}
            </span>

            <CopyButton text={BASE_URL} />
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            All requests must include the header:{' '}
            <code className="text-primary font-mono-code bg-primary/10 px-1 rounded">
              Authorization: Bearer SESSION_TOKEN
            </code>
          </p>
        </div>

        {/* Sections */}
        <Section
          icon={Shield}
          title="1. Auth System"
          color="text-yellow-400"
        >
          <
// @ts-ignore
          Endpoint
            method="POST"
            path="/auth/login"
            title="Login / Authenticate"
            description="Authenticate a client and receive a session token."
            body={`{
  "client_id": "pc-001",
  "api_key": "YOUR_SECRET_KEY"
}`}
            response={`{
  "success": true,
  "token": "SESSION_TOKEN"
}`}
          />
        </Section>

      </main>
    </div>
  );
}