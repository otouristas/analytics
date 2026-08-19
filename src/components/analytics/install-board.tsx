import { Button } from "@/components/ui/button";
import { type IngestEvent } from "@/lib/analytics/ingest";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { useAnalytics } from "@/lib/analytics/store";
import { getExclusions, addExclusion, removeExclusion, getDroppedCount, type ExclusionRule } from "@/lib/analytics/exclusions";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Download, ShieldAlert, Plus, Trash2 } from "lucide-react";

type Stack = "next" | "wordpress" | "shopify" | "gtm" | "script" | "react" | "webflow";

export function InstallBoard() {
  const setView = useAnalytics((s) => s.setView);
  const projectId = useAnalytics((s) => s.projectId);
  const project = PROJECT_BY_ID[projectId];
  const [stack, setStack] = useState<Stack>("next");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [cookieless, setCookieless] = useState(true);

  // Exclusions state
  const [exclusions, setExclusions] = useState<ExclusionRule[]>([]);
  const [newPattern, setNewPattern] = useState("");
  const [newKind, setNewKind] = useState<"path" | "ip">("path");

  useEffect(() => {
    setOrigin(window.location.origin);
    setExclusions(getExclusions());
  }, []);

  const snippets = useMemo(
    () => buildSnippets(origin || "https://analytics.discovercyclades.gr", project.writeKey, cookieless),
    [origin, project.writeKey, cookieless],
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddExclusion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim()) return;
    const rule = addExclusion(newPattern.trim(), newKind);
    setExclusions([...exclusions, rule]);
    setNewPattern("");
  };

  const handleRemoveExclusion = (id: string) => {
    removeExclusion(id);
    setExclusions(exclusions.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* Header */}
      <section className="border-b border-border px-5 py-6">
        <p className="kicker">{project.host}</p>
        <h2 className="font-display text-3xl italic tracking-tight text-fg">Tracking Snippets &amp; Platform Installers</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          First-party, cookieless tracking client (<code className="text-fg font-mono">meridian.js</code>). Ingests pageviews, clicks, outbound intent, rage clicks, and JavaScript runtime errors with zero third-party cookies.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-subtle">
          <span>Property Write Key: <strong className="text-fg">{project.writeKey}</strong></span>
          <span>Dropped Events (Exclusions): <strong className="text-amber-400">{getDroppedCount()}</strong></span>
        </div>
      </section>

      {/* Installer Tabs */}
      <section className="border-b border-border bg-surface/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["next", "Next.js / React"],
              ["wordpress", "WordPress Plugin"],
              ["shopify", "Shopify"],
              ["gtm", "Google Tag Manager"],
              ["script", "Plain HTML Script"],
              ["webflow", "Webflow / Framer / Wix"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStack(id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                stack === id
                  ? "bg-elevated text-fg shadow-[var(--shadow-border)]"
                  : "text-muted hover:text-fg hover:bg-elevated/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Snippet Card */}
      <section className="p-6 border-b border-border">
        <div className="rounded-2xl border border-border bg-surface/50 p-5">
          <div className="flex items-center justify-between">
            <span className="kicker capitalize font-mono">{stack} Integration Code</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(snippets[stack])}
            >
              {copied ? <Check className="mr-1 size-3.5 text-positive" /> : <Copy className="mr-1 size-3.5" />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl bg-elevated p-4 font-mono text-xs text-fg leading-relaxed">
            <pre className="whitespace-pre-wrap">{snippets[stack]}</pre>
          </div>

          {stack === "wordpress" && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
              <span className="text-muted">Direct download ready in repository at <code className="text-fg">public/plugins/meridian-analytics/</code></span>
              <a
                href="/plugins/meridian-analytics/meridian-analytics.php"
                download="meridian-analytics.php"
                className="inline-flex items-center gap-1 rounded bg-positive/10 px-3 py-1 text-xs font-medium text-positive hover:bg-positive/20 transition-colors"
              >
                <Download className="size-3.5" /> Download PHP Plugin
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Path & IP Exclusion Manager */}
      <section className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker">Security &amp; Data Hygiene</p>
            <h3 className="font-display text-xl italic text-fg">Path &amp; IP Exclusions</h3>
          </div>
          <span className="text-xs text-subtle font-mono">{exclusions.length} active rule(s)</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Events matching these wildcard URL patterns or IP addresses are permanently dropped before ingestion to protect your analytics from preview/staging noise.
        </p>

        <form onSubmit={handleAddExclusion} className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder="e.g. /preview/*, /admin/*, or 192.168.1.*"
            className="flex-1 min-w-[200px] rounded-lg border border-border bg-bg px-3 py-2 text-xs text-fg outline-none focus:border-positive/50"
          />
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as "path" | "ip")}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-fg outline-none"
          >
            <option value="path">URL Path Wildcard</option>
            <option value="ip">Client IP Wildcard</option>
          </select>
          <Button type="submit" size="sm" disabled={!newPattern.trim()}>
            <Plus className="mr-1 size-3.5" /> Add Rule
          </Button>
        </form>

        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface/30">
          {exclusions.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="rounded bg-elevated px-2 py-0.5 font-mono text-[10px] text-muted capitalize">
                  {rule.kind}
                </span>
                <span className="font-mono text-fg font-medium">{rule.pattern}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExclusion(rule.id)}
                className="text-subtle hover:text-danger p-1"
                aria-label="Delete rule"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildSnippets(host: string, writeKey: string, cookieless: boolean): Record<Stack, string> {
  const extra = cookieless ? `\n    s.dataset.cookieless = "1";` : "";
  const attr = cookieless ? ` data-cookieless="1"` : "";

  return {
    next: `// app/components/MeridianTracker.tsx
"use client";
import { useEffect } from "react";

export function MeridianTracker() {
  useEffect(() => {
    if (document.querySelector("script[data-meridian]")) return;
    const s = document.createElement("script");
    s.src = "${host}/meridian.js";
    s.async = true;
    s.dataset.meridianId = "${writeKey}";
    s.dataset.host = "${host}";
    s.dataset.meridian = "1";${extra}
    document.head.appendChild(s);
  }, []);
  return null;
}`,
    wordpress: `/**
 * WordPress Plugin Installation:
 * 1. Download meridian-analytics.php from the button below
 * 2. Upload to wp-content/plugins/meridian-analytics/
 * 3. In WP Admin -> Settings -> Meridian Analytics, enter Write Key: ${writeKey}
 */`,
    shopify: `<!-- 1. In Shopify theme.liquid, add before </head>: -->
<script defer data-meridian-id="${writeKey}" data-host="${host}"${attr} src="${host}/meridian.js"></script>

<!-- 2. In Settings -> Checkout -> Additional Scripts (Order Pixel): -->
<script>
  fetch("${host}/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      writeKey: "${writeKey}",
      transaction_id: "{{ order.id }}",
      amount_cents: Math.round({{ total_price }}),
      currency: "{{ shop.currency }}"
    })
  });
</script>`,
    gtm: `<!-- Google Tag Manager Custom HTML Tag -->
<script>
  (function(){
    var s=document.createElement("script");
    s.src="${host}/meridian.js";
    s.async=true;
    s.setAttribute("data-meridian-id","${writeKey}");
    s.setAttribute("data-host","${host}");${cookieless ? `\n    s.setAttribute("data-cookieless","1");` : ""}
    document.head.appendChild(s);
  })();
</script>`,
    script: `<!-- Place directly before </head> in your HTML -->
<script defer data-meridian-id="${writeKey}" data-host="${host}"${attr} src="${host}/meridian.js"></script>`,
    react: `// In your root App.jsx / layout component:
import { useEffect } from "react";

export function useMeridian() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "${host}/meridian.js";
    s.async = true;
    s.dataset.meridianId = "${writeKey}";
    s.dataset.host = "${host}";${cookieless ? `\n    s.dataset.cookieless = "1";` : ""}
    document.head.appendChild(s);
  }, []);
}`,
    webflow: `<!-- In Webflow / Framer / Wix / Ghost Site Settings -> Custom Code -> Head Code -->
<script defer data-meridian-id="${writeKey}" data-host="${host}"${attr} src="${host}/meridian.js"></script>`,
  };
}
