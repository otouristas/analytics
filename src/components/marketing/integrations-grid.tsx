import { Layers, CheckCircle2 } from "lucide-react";

export function IntegrationsGrid() {
  const integrations = [
    { name: "Google Search Console", category: "Search", status: "Native" },
    { name: "Google Analytics 4", category: "Traffic", status: "Sync" },
    { name: "Google Ads", category: "Paid Media", status: "ROAS" },
    { name: "Meta Ads", category: "Paid Media", status: "ROAS" },
    { name: "Vercel", category: "Deployment", status: "Telemetry" },
    { name: "Shopify", category: "Commerce", status: "Webhook" },
    { name: "Stripe", category: "Commerce", status: "Verified" },
    { name: "Polar.sh", category: "Commerce", status: "Webhook" },
    { name: "LemonSqueezy", category: "Commerce", status: "Webhook" },
    { name: "Slack", category: "Alerts", status: "Realtime" },
    { name: "MCP Protocol", category: "AI Agents", status: "JSON-RPC" },
    { name: "REST / Webhooks", category: "Developer", status: "Ingest" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="kicker block text-accent mb-2">Ecosystem</span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg text-balance">
          Connect your entire growth stack
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto">
          One unified ingestion layer for organic search, paid campaigns, webhooks, and AI agent queries.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 hover:border-border-strong transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="caption text-[10px] uppercase">{item.category}</span>
              <span className="rounded bg-accent-soft px-1.5 py-0.2 text-[10px] font-semibold text-accent">
                {item.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-fg tracking-tight truncate">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
