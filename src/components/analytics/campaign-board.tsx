import { campaigns } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Megaphone, Upload, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

type AdSpendRow = {
  date: string;
  campaign: string;
  spend: number;
  clicks: number;
  impressions: number;
  network: "meta" | "google";
};

export function CampaignBoard() {
  const { events, people, stats, project } = useRealtime();
  const rows = useMemo(() => campaigns(events), [events]);
  const [adSpend, setAdSpend] = useState<AdSpendRow[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "ads">("ads");

  // UTM builder state
  const [url, setUrl] = useState("https://discovercyclades.gr/en");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("cyclades-summer-promo");

  const built = useMemo(() => {
    try {
      const next = new URL(url);
      next.searchParams.set("utm_source", source);
      next.searchParams.set("utm_medium", medium);
      next.searchParams.set("utm_campaign", campaign);
      return next.toString();
    } catch {
      return "";
    }
  }, [url, source, medium, campaign]);

  const totalSpend = adSpend.reduce((s, r) => s + r.spend, 0);
  const paidSessions = people.filter((p) => p.source === "paid_search" || p.source === "paid_social" || p.source === "facebook" || p.source === "gads").length;
  const confirmedRev = (stats.confirmedRevenueCents ?? 0) / 100;
  const roas = totalSpend > 0 ? (confirmedRev / totalSpend) : null;

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result ?? "");
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const parsed: AdSpendRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i]!.split(",").map((p) => p.trim());
        if (parts.length >= 4) {
          parsed.push({
            date: parts[0] || new Date().toISOString().slice(0, 10),
            campaign: parts[1] || "Campaign",
            spend: parseFloat(parts[2] || "0") || 0,
            clicks: parseInt(parts[3] || "0", 10) || 0,
            impressions: parseInt(parts[4] || "0", 10) || 0,
            network: (parts[5]?.toLowerCase().includes("google") ? "google" : "meta") as "meta" | "google",
          });
        }
      }
      if (parsed.length > 0) setAdSpend(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <PageShell
      kicker={`Campaigns &amp; Ads · ${project.host}`}
      title="Paid Acquisition &amp; UTM Tracking"
      dek="Connect Meta Ads and Google Ads spend via CSV or server token. Calculates true ROAS against server-verified revenue without fabricated vanity metrics."
      actions={
        <div className="flex gap-2">
          <Button
            variant={activeTab === "ads" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ads")}
          >
            Ad Spend &amp; ROAS
          </Button>
          <Button
            variant={activeTab === "builder" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("builder")}
          >
            UTM Link Builder
          </Button>
        </div>
      }
    >
      {activeTab === "ads" ? (
        <>
          {/* Ad Performance KPI Strip */}
          <section className="grid gap-px bg-border sm:grid-cols-4">
            <article className="bg-bg p-5">
              <p className="kicker">Recorded Ad Spend</p>
              <p className="display-stat mt-2 text-3xl text-fg">
                €{totalSpend.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-subtle">from {adSpend.length} uploaded records</p>
            </article>

            <article className="bg-bg p-5">
              <p className="kicker">Attributed Paid Sessions</p>
              <p className="display-stat mt-2 text-3xl text-fg">{paidSessions}</p>
              <p className="mt-1 text-xs text-subtle">tagged via fbclid / gclid / utm</p>
            </article>

            <article className="bg-bg p-5">
              <p className="kicker">Confirmed Revenue</p>
              <p className="display-stat mt-2 text-3xl text-fg">€{confirmedRev.toFixed(2)}</p>
              <p className="mt-1 text-xs text-subtle">server-verified orders</p>
            </article>

            <article className="bg-bg p-5">
              <p className="kicker">Return on Ad Spend (ROAS)</p>
              <p className="display-stat mt-2 text-3xl text-fg">
                {roas !== null && roas > 0 ? `${roas.toFixed(2)}x` : "—"}
              </p>
              <p className="mt-1 text-xs text-subtle">
                {totalSpend === 0 ? "Requires spend data" : confirmedRev === 0 ? "No confirmed revenue yet" : "confirmed / spend"}
              </p>
            </article>
          </section>

          {/* Upload / Empty State */}
          <section className="p-6">
            <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
              <Megaphone className="mx-auto size-10 text-muted" />
              <h3 className="mt-3 font-display text-xl italic text-fg">Sync Ad Network Spend</h3>
              <p className="mt-1 max-w-md mx-auto text-xs text-muted leading-relaxed">
                Upload your Meta Ads or Google Ads export CSV (<code className="text-fg">date, campaign, spend, clicks, impressions, network</code>) or configure the <code className="text-fg">META_ACCESS_TOKEN</code> environment variable.
              </p>

              <div className="mt-5 flex justify-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-elevated px-4 py-2 text-xs font-medium text-fg shadow-sm hover:bg-elevated/80 transition-colors">
                  <Upload className="size-3.5" />
                  <span>Upload Campaign CSV</span>
                  <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" />
                </label>
              </div>
            </div>
          </section>

          {/* Ad Spend Table */}
          {adSpend.length > 0 && (
            <section className="border-t border-border p-5">
              <h3 className="font-display text-lg italic text-fg">Uploaded Campaign Records</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-subtle border-b border-border">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Network</th>
                      <th className="py-2">Campaign</th>
                      <th className="py-2 text-right">Spend</th>
                      <th className="py-2 text-right">Clicks</th>
                      <th className="py-2 text-right">Impressions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adSpend.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface/30">
                        <td className="py-2.5 font-mono text-xs text-subtle">{row.date}</td>
                        <td className="py-2.5 text-xs capitalize font-medium text-fg">{row.network}</td>
                        <td className="py-2.5 text-xs text-fg">{row.campaign}</td>
                        <td className="py-2.5 text-right font-mono text-xs font-semibold text-fg">€{row.spend.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono text-xs text-muted">{row.clicks}</td>
                        <td className="py-2.5 text-right font-mono text-xs text-muted">{row.impressions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      ) : (
        /* UTM Builder */
        <section className="p-6">
          <div className="rounded-2xl border border-border bg-surface/50 p-6 space-y-4">
            <h3 className="font-display text-xl italic text-fg">Canonical UTM Link Builder</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Target Destination URL" value={url} onChange={setUrl} />
              <Field label="Campaign Source (utm_source)" value={source} onChange={setSource} />
              <Field label="Campaign Medium (utm_medium)" value={medium} onChange={setMedium} />
              <Field label="Campaign Name (utm_campaign)" value={campaign} onChange={setCampaign} />
            </div>

            <div className="rounded-xl bg-elevated p-4">
              <p className="text-[10px] uppercase tracking-wider text-subtle font-mono">Generated Campaign URL</p>
              <p className="mt-1 font-mono text-xs text-fg break-all">{built}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="kicker">Active Campaign Terms in Live Stream</h3>
            <ul className="mt-3 space-y-2">
              {rows.length === 0 && <li className="text-sm text-subtle">No campaign terms detected in current stream window.</li>}
              {rows.map((row) => (
                <li key={row.label} className="flex justify-between text-sm rounded-lg bg-surface/40 p-2.5 border border-border">
                  <span className="font-mono text-xs text-fg">{row.label}</span>
                  <span className="font-mono text-xs font-semibold text-muted">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-xs text-muted block">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-bg px-3 text-xs text-fg outline-none focus:border-positive/50"
      />
    </label>
  );
}
