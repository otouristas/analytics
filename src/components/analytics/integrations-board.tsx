import { useState } from "react";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { getIntegrationsList, type IntegrationConnection } from "@/lib/analytics/integrations";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function IntegrationsBoard() {
  const { project } = useRealtime();
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(getIntegrationsList());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    const fullUrl = text.startsWith("http") ? text : `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageShell
      kicker={`Integrations · ${project.host}`}
      title="Connected Services &amp; Webhooks"
      dek="Connect server-trusted payment providers, advertising networks, and CMS plugins. Meridian validates signatures and ensures clean data provenance."
    >
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item) => {
          const isConnected = item.status === "connected";
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface/50 p-5 transition-all hover:border-border/80"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg italic text-fg">{item.name}</h3>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      isConnected ? "bg-positive/10 text-positive" : "bg-elevated text-subtle",
                    )}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="size-3" /> Connected
                      </>
                    ) : (
                      "Not Connected"
                    )}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted">
                  {item.category === "payment"
                    ? "Inbound server webhooks for confirmed purchases, bookings, and refunds."
                    : item.category === "advertising"
                      ? "Cost and campaign performance data synchronization."
                      : item.category === "seo"
                        ? "Search impression and keyword query aggregate feeds."
                        : "First-party script tag injection and cookie-free analytics."}
                </p>

                {item.webhookUrl && !item.webhookUrl.includes("plugins") && (
                  <div className="mt-4 rounded-lg bg-elevated/70 p-2.5">
                    <p className="text-[10px] text-subtle font-mono uppercase">Webhook URL Endpoint</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[11px] text-fg">
                        {item.webhookUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.webhookUrl)}
                        className="rounded p-1 text-muted hover:text-fg transition-colors"
                        aria-label="Copy Webhook URL"
                      >
                        {copiedId === item.id ? (
                          <Check className="size-3.5 text-positive" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] text-subtle capitalize">Category: {item.category}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleCopy(item.id, item.webhookUrl)}>
                  {copiedId === item.id ? "Copied" : "Copy Endpoint"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
