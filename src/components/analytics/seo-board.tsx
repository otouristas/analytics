import { ChannelLogo } from "@/components/analytics/channel-logo";
import { searchTerms } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Search, Upload, Sparkles, TrendingUp, Info, HelpCircle } from "lucide-react";
import { formatPct } from "@/lib/analytics/visitor-name";

type GscRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  country?: string;
  device?: string;
};

const SEED_GSC: GscRow[] = [
  { query: "ferry from athens to paros", page: "/routes/athens-paros", clicks: 124, impressions: 1850, ctr: 0.067, position: 5.2 },
  { query: "best beaches in naxos", page: "/islands/naxos/beaches", clicks: 92, impressions: 1420, ctr: 0.065, position: 6.8 },
  { query: "milos boat tour kleftiko", page: "/islands/milos/boat-tours", clicks: 78, impressions: 980, ctr: 0.079, position: 4.1 },
  { query: "santorini sunset viewpoint without crowds", page: "/islands/santorini/secrets", clicks: 45, impressions: 1200, ctr: 0.037, position: 9.4 },
  { query: "sifnos pottery workshops", page: "/islands/sifnos/culture", clicks: 31, impressions: 450, ctr: 0.068, position: 7.3 },
];

export function SeoBoard() {
  const { events, pages, project, people, stats } = useRealtime();
  const [gscData, setGscData] = useState<GscRow[]>(SEED_GSC);
  const terms = useMemo(() => searchTerms(events), [events]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result ?? "");
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const parsed: GscRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i]!.split(",").map((p) => p.trim());
        if (parts.length >= 6) {
          parsed.push({
            query: parts[0] || "",
            page: parts[1] || "/",
            clicks: parseInt(parts[2] || "0", 10) || 0,
            impressions: parseInt(parts[3] || "0", 10) || 0,
            ctr: parseFloat(parts[4] || "0") || 0,
            position: parseFloat(parts[5] || "0") || 0,
            country: parts[6],
            device: parts[7],
          });
        }
      }
      if (parsed.length > 0) setGscData(parsed);
    };
    reader.readAsText(file);
  };

  // SEO Opportunities: Position 4 - 15 with high impressions
  const opportunities = useMemo(() => {
    return gscData.filter((r) => r.position >= 4 && r.position <= 15 && r.impressions >= 400);
  }, [gscData]);

  return (
    <PageShell
      kicker={`Organic Search · ${project.host}`}
      title="Search Console &amp; On-Site SEO"
      dek="Correlate Google Search Console keyword queries with first-party Meridian on-site engagement, dwell time, and partner outbound conversions."
      actions={
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-fg shadow-sm hover:bg-elevated/80 transition-colors">
          <Upload className="size-3.5" />
          <span>Import GSC CSV</span>
          <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" />
        </label>
      }
    >
      {/* Search Overview Strip */}
      <section className="grid gap-px bg-border sm:grid-cols-4">
        <article className="bg-bg p-5">
          <p className="kicker">GSC Impressions</p>
          <p className="display-stat mt-2 text-3xl text-fg">
            {gscData.reduce((s, r) => s + r.impressions, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-subtle">across {gscData.length} indexed terms</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">GSC Clicks</p>
          <p className="display-stat mt-2 text-3xl text-fg">
            {gscData.reduce((s, r) => s + r.clicks, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-subtle">organic search entrances</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Avg Click-Through (CTR)</p>
          <p className="display-stat mt-2 text-3xl text-fg">
            {formatPct(
              gscData.reduce((s, r) => s + r.clicks, 0) /
                Math.max(1, gscData.reduce((s, r) => s + r.impressions, 0)),
            )}
          </p>
          <p className="mt-1 text-xs text-subtle">aggregate SERP conversion</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">SEO High-Value Targets</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="display-stat text-3xl text-positive">{opportunities.length}</span>
            <Sparkles className="size-4 text-positive" />
          </div>
          <p className="mt-1 text-xs text-subtle">positions 4–15 with demand</p>
        </article>
      </section>

      {/* Explicit Aggregate Joining Notice */}
      <section className="border-b border-border bg-surface/50 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Info className="size-3.5 text-positive shrink-0" />
          <p className="font-medium text-fg">
            Privacy Guarantee: GSC data is joined at aggregate grain (landing page + date). We do not stitch search queries to individual visitor session IDs.
          </p>
        </div>
      </section>

      {/* Aggregate GSC Query & Landing Performance Matrix */}
      <section className="p-5 border-b border-border">
        <h3 className="font-display text-xl italic text-fg">Query &amp; Landing Performance Matrix</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle border-b border-border">
              <tr>
                <th className="py-2.5">Query &amp; Landing Page</th>
                <th className="py-2.5 text-right">GSC Clicks</th>
                <th className="py-2.5 text-right">Impressions</th>
                <th className="py-2.5 text-right">CTR</th>
                <th className="py-2.5 text-right">Position</th>
                <th className="py-2.5 text-right">Meridian Sessions</th>
                <th className="py-2.5 text-right">Outbound Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gscData.map((row, idx) => {
                const matchedSessions = people.filter((p) => p.pages.includes(row.page)).length;
                const matchedOutbound = events.filter((e) => e.path === row.page && e.kind === "outbound").length;

                return (
                  <tr key={idx} className="hover:bg-surface/30">
                    <td className="py-3">
                      <div>
                        <span className="font-medium text-fg">{row.query}</span>
                        <span className="block font-mono text-xs text-subtle">{row.page}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-fg font-semibold">{row.clicks}</td>
                    <td className="py-3 text-right font-mono text-xs text-muted">{row.impressions}</td>
                    <td className="py-3 text-right font-mono text-xs text-muted">{formatPct(row.ctr)}</td>
                    <td className="py-3 text-right font-mono text-xs text-muted">{row.position.toFixed(1)}</td>
                    <td className="py-3 text-right font-mono text-xs text-fg">{matchedSessions || "—"}</td>
                    <td className="py-3 text-right font-mono text-xs text-positive">{matchedOutbound || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEO Opportunity Engine */}
      <section className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker">Algorithmic Opportunity Engine</p>
            <h3 className="mt-1 font-display text-xl italic text-fg">Striking Distance Opportunities</h3>
          </div>
          <span className="rounded bg-positive/10 px-2 py-1 text-xs text-positive font-medium">
            High Impact Potential
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {opportunities.map((opp) => (
            <div key={opp.query} className="rounded-xl border border-border bg-elevated/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-fg text-sm">{opp.query}</span>
                <span className="font-mono text-xs text-positive">Pos #{opp.position.toFixed(1)}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-subtle">{opp.page}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted">
                <span>{opp.impressions} search impressions</span>
                <span>Current CTR: {formatPct(opp.ctr)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
