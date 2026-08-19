import { useState } from "react";
import { PropertyHeader } from "@/components/product/property-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getIntegrationsList, type IntegrationConnection } from "@/lib/analytics/integrations";
import { Copy, Check, CheckCircle2, Layers, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function IntegrationsBoard() {
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(getIntegrationsList());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    const fullUrl = text.startsWith("http") ? text : `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const connected = integrations.filter((i) => i.status === "connected");
  const available = integrations.filter((i) => i.status !== "connected");

  return (
    <div className="flex-1 overflow-y-auto pb-16">
      {/* 1. Property Header */}
      <PropertyHeader
        title="Integrations & Webhooks"
        subtitle="Connect verified payment gateways, ad networks, GSC, and AI protocols"
        kpis={[
          { label: "Active Integrations", value: String(connected.length), delta: "Healthy", positive: true },
          { label: "Available Connectors", value: String(available.length), delta: "Ready", positive: true },
          { label: "Webhook Latency", value: "< 240ms", delta: "Normal", positive: true },
          { label: "Signature Security", value: "HMAC-SHA256", delta: "Enforced", positive: true },
        ]}
      />

      <div className="p-4 sm:p-6 space-y-8">
        {/* 2. Connected Integrations Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-fg tracking-tight">Connected Services</h2>
            <span className="caption rounded-full bg-positive-soft px-2 py-0.2 font-medium text-positive">
              {connected.length} active
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-fg">{item.name}</h3>
                    <StatusBadge status="connected" size="sm" />
                  </div>

                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    {item.category === "payment"
                      ? "Inbound server webhooks for confirmed purchases and refunds."
                      : item.category === "seo"
                        ? "Search impression and keyword query aggregate feeds."
                        : "First-party script tag injection and cookie-free analytics."}
                  </p>

                  {item.webhookUrl && !item.webhookUrl.includes("plugins") && (
                    <div className="mt-3 rounded-lg bg-elevated/60 p-2 border border-border/50">
                      <span className="caption block uppercase font-mono text-[10px]">Endpoint</span>
                      <div className="mt-0.5 flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[11px] text-accent">{item.webhookUrl}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.webhookUrl)}
                          className="rounded p-1 text-muted hover:text-fg"
                        >
                          {copiedId === item.id ? <Check className="size-3 text-positive" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <span className="caption capitalize">{item.category}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.webhookUrl)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    {copiedId === item.id ? "Copied" : "Copy Endpoint"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Available Connectors Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-fg tracking-tight">Available Integrations</h2>
            <span className="caption">{available.length} connectors</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-surface/60 p-4 hover:border-border-strong transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-fg">{item.name}</h3>
                    <StatusBadge status="neutral" label="Available" size="sm" />
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    Connect {item.name} to stream external events and enrich conversion intelligence.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="caption capitalize">{item.category}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.webhookUrl)}
                    className="inline-flex items-center gap-1 rounded-md bg-elevated px-2.5 py-1 text-xs font-medium text-fg hover:bg-subtle-surface transition-colors"
                  >
                    <Plus className="size-3" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
