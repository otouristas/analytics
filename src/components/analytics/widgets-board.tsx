import { useState } from "react";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, Code2 } from "lucide-react";

export function WidgetsBoard() {
  const { project } = useRealtime();
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const embedUrl = typeof window !== "undefined" ? `${window.location.origin}/w/dc` : "/w/dc";
  const iframeSnippet = `<iframe src="${embedUrl}?theme=${theme}" width="280" height="64" frameborder="0" scrolling="no" style="border:none;overflow:hidden;border-radius:12px;"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell
      kicker={`Widgets · ${project.host}`}
      title="Embeddable Live Badges"
      dek="Lightweight, read-only live visitor badges for public display, footer status widgets, and partner dashboards. Fully cookieless, zero PII, fast load."
    >
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Live Preview Card */}
        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <p className="kicker">Live Interactive Preview</p>
          <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-border bg-bg/80 p-8">
            <iframe
              src={`/w/dc?theme=${theme}`}
              width="280"
              height="64"
              title="Meridian Live Widget Preview"
              className="rounded-xl border border-border bg-bg shadow-sm"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted">Theme:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded px-2.5 py-1 text-xs ${theme === "dark" ? "bg-elevated text-fg font-medium" : "text-muted"}`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded px-2.5 py-1 text-xs ${theme === "light" ? "bg-elevated text-fg font-medium" : "text-muted"}`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface/50 p-6">
          <div>
            <div className="flex items-center justify-between">
              <p className="kicker">HTML Embed Snippet</p>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="mr-1 size-3.5 text-positive" /> : <Copy className="mr-1 size-3.5" />}
                {copied ? "Copied!" : "Copy Snippet"}
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl bg-elevated p-4 font-mono text-xs text-fg leading-relaxed">
              <code>{iframeSnippet}</code>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-subtle">
            <span>Direct link: <a href="/w/dc" target="_blank" rel="noreferrer" className="text-muted underline inline-flex items-center gap-1">/w/dc <ExternalLink className="size-3" /></a></span>
            <span className="flex items-center gap-1"><Code2 className="size-3.5 text-positive" /> Zero cookie overhead</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
