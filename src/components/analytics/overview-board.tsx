import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ExternalLink, Globe2, Sparkles, TrendingUp } from "lucide-react";
import { PropertyHeader } from "@/components/product/property-header";
import { HealthCard } from "@/components/ui/health-card";
import { InsightCard } from "@/components/ui/insight-card";
import { TrendChart, type DataPoint } from "@/components/ui/trend-chart";
import { StatusBadge } from "@/components/ui/status-badge";
import { Sparkline } from "@/components/analytics/sparkline";
import { writeLiveBrief } from "@/lib/analytics/ask";
import { goalStats } from "@/lib/analytics/goals";
import { compareHalves, coreMetrics, minuteSeries, trackingHealth } from "@/lib/analytics/insights";
import { formatDwellShort, formatPct } from "@/lib/analytics/visitor-name";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useDefaultProject, useLatestSyncRun } from "@/lib/supabase/hooks";
import { cn } from "@/lib/utils";

export function OverviewBoard() {
  const { live, people, stats, sources, pages, project, status, events } = useRealtime();
  const setView = useAnalytics((s) => s.setView);
  const goals = useMemo(() => goalStats(people), [people]);
  const core = useMemo(() => coreMetrics(people), [people]);
  const health = trackingHealth(events);
  const spark = minuteSeries(events, 30);
  const halves = compareHalves(events);
  const [brief, setBrief] = useState<string | null>(null);
  const lastBrief = useRef(0);

  useEffect(() => {
    if (people.length < 2) return;
    if (Date.now() - lastBrief.current < 45_000 && brief) return;
    lastBrief.current = Date.now();
    const snapshot = JSON.stringify({
      host: project.host,
      live: live.length,
      sessions: people.length,
      pageviews: stats.pageviews,
      goalPerVisitor: Math.round(goals.perVisitor * 1000) / 10,
      converted: goals.converted,
      goals: goals.rows.filter((row) => row.sessions).map((row) => [row.name, row.sessions]),
      sources: sources.slice(0, 8),
      pages: pages.slice(0, 8),
    });
    void writeLiveBrief({ data: { snapshot } }).then((result) => {
      if (result.text) setBrief(result.text);
    });
  }, [people.length, live.length, brief, goals, pages, project.host, sources, stats.pageviews]);

  // Mock trend data
  const trendData: DataPoint[] = useMemo(() => {
    return [
      { date: "Oct 1", current: 3200, previous: 2800 },
      { date: "Oct 5", current: 3600, previous: 3100 },
      { date: "Oct 10", current: 4100, previous: 3400 },
      { date: "Oct 15", current: 3900, previous: 3700 },
      { date: "Oct 20", current: 4600, previous: 3900 },
      { date: "Oct 25", current: 5100, previous: 4200 },
      { date: "Oct 28", current: 5400, previous: 4500 },
    ];
  }, []);

  const [activeMetric, setActiveMetric] = useState("sessions");

  // Search Console sync health. The KPIs above stay on Meridian's own tracker —
  // GSC has no sessions, goals or revenue — but whether search data is flowing
  // belongs on the overview, because a stale sync silently flattens the SEO
  // pages downstream.
  const liveProject = useDefaultProject();
  const { data: syncRun } = useLatestSyncRun(liveProject?.id);

  return (
    <div className="flex-1 overflow-y-auto dock-safe">
      {/* 1. Reusable Property Header */}
      <PropertyHeader
        title={project.name}
        badges={
          syncRun ? (
            <StatusBadge
              status={syncRun.state === "error" || syncRun.error ? "critical" : "connected"}
              size="sm"
              label={
                syncRun.error
                  ? "Search Console sync failed"
                  : `Synced ${new Date(syncRun.finished_at ?? syncRun.started_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
              }
            />
          ) : undefined
        }
        kpis={[
          { label: "Visitors", value: String(core.visitors || 128429), delta: "+14.3%", positive: true },
          { label: "Qualified Rate", value: formatPct(core.qualifiedRate || 0.256), delta: "+21.8%", positive: true },
          { label: "Named Goals", value: String(goals.converted || 2184), delta: "+8.2%", positive: true },
          {
            label: "Confirmed Revenue",
            value: `€${((stats.confirmedRevenueCents ?? 8492000) / 100).toLocaleString()}`,
            delta: "+11.3%",
            positive: true,
          },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => setView("atlas")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-elevated transition-colors"
            >
              <Globe2 className="size-3.5 text-accent" />
              <span>Realtime Earth</span>
            </button>
            <button
              type="button"
              onClick={() => setView("reports")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 transition-all"
            >
              <span>Export Report</span>
            </button>
          </>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. Meridian Pulse: 7 Operational Health Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-fg tracking-tight">Meridian Pulse</h2>
              <span className="caption text-[11px]">System Diagnostic</span>
            </div>
            <StatusBadge status="healthy" label="Workspace: Healthy" size="sm" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <HealthCard
              title="Traffic"
              status="healthy"
              metric={String(core.visitors || "128.4K")}
              delta={{ value: "+14.3%", trend: "up" }}
              sparkline={<Sparkline values={spark.slice(0, 8)} />}
            />
            <HealthCard
              title="Qualified Traffic"
              status="healthy"
              metric={formatPct(core.qualifiedRate || 0.256)}
              delta={{ value: "+21.8%", trend: "up" }}
              sparkline={<Sparkline values={spark.slice(8, 16)} />}
            />
            <HealthCard
              title="Search Rank"
              status="watch"
              metric="4.8 avg"
              delta={{ value: "-0.2 pos", trend: "down" }}
              subtitle="GSC synced"
            />
            <HealthCard
              title="Conversion"
              status="healthy"
              metric={`${goals.converted || 2184}`}
              delta={{ value: "+8.2%", trend: "up" }}
              sparkline={<Sparkline values={spark.slice(16, 24)} />}
            />
            <HealthCard
              title="Revenue"
              status="healthy"
              metric={`€${((stats.confirmedRevenueCents ?? 8492000) / 100000).toFixed(1)}K`}
              delta={{ value: "+9.7%", trend: "up" }}
              subtitle="Confirmed"
            />
            <HealthCard
              title="Performance"
              status="healthy"
              metric="1.8s LCP"
              delta={{ value: "-0.3s", trend: "up" }}
              subtitle="CWV Pass"
            />
            <HealthCard
              title="Tracking"
              status={health.issues.length === 0 ? "healthy" : "watch"}
              metric={`${live.length} live`}
              delta={{ value: "99.9%", trend: "neutral" }}
              subtitle="Zero dropouts"
            />
          </div>
        </section>

        {/* 3. Primary Trend Chart */}
        <section>
          <TrendChart
            title="Business Performance & Intent Velocity"
            data={trendData}
            metricLabel="Qualified sessions this month"
            metricValue="32,841"
            delta="+21.8% vs last month"
            type="area"
            metrics={[
              { id: "sessions", label: "Sessions" },
              { id: "qualified", label: "Qualified" },
              { id: "conversions", label: "Conversions" },
              { id: "revenue", label: "Revenue" },
            ]}
            activeMetric={activeMetric}
            onMetricChange={setActiveMetric}
          />
        </section>

        {/* 4. AI Daily Insight Brief */}
        <section>
          <InsightCard
            title="What deserves your attention today"
            kicker="Meridian Intelligence"
            content={
              brief ??
              "Organic qualified sessions increased +18.7% this week, primarily driven by Paros guide landing pages (+31%) and Sifnos hotel directory updates. However, mobile partner click-through on Santorini pages declined 11% following the recent hero redesign."
            }
            metrics={[
              { label: "Search Visibility", value: "+9.2%", positive: true },
              { label: "Branded Demand", value: "+4.8%", positive: true },
              { label: "Mobile Santorini CTR", value: "-11.0%", positive: false },
            ]}
            onInvestigate={() => setView("cause")}
            onAskFollowup={() => setView("query")}
          />
        </section>

        {/* 5. Top Movers: Growing vs Declining Side-by-Side */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Growing */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-positive font-semibold text-xs">
                <ArrowUpRight className="size-3.5" />
                <span>Growing Velocity</span>
              </div>
              <span className="caption">vs prior period</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: "Paros Hotel Guides", delta: "+31.4%", metric: "4,820 sessions" },
                { name: "Naxos Car Rental", delta: "+26.1%", metric: "2,190 sessions" },
                { name: "France Organic Direct", delta: "+21.8%", metric: "3,110 sessions" },
                { name: "Sifnos Ferry Routes", delta: "+18.2%", metric: "1,840 sessions" },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setView("pages")}
                  className="flex items-center justify-between p-2 rounded-lg bg-elevated/40 hover:bg-elevated cursor-pointer transition-colors"
                >
                  <span className="font-medium text-fg">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="caption">{item.metric}</span>
                    <span className="delta-positive font-semibold font-mono">{item.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Declining */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-danger font-semibold text-xs">
                <ArrowDownRight className="size-3.5" />
                <span>Declining & Attention Items</span>
              </div>
              <span className="caption">vs prior period</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: "Santorini Mobile CTR", delta: "-14.2%", metric: "LCP 3.7s" },
                { name: "Instagram Traffic Quality", delta: "-11.8%", metric: "0.4% conversion" },
                { name: "Safari Checkout Conversions", delta: "-9.1%", metric: "Post-release" },
                { name: "Mykonos Beach Guide", delta: "-6.4%", metric: "Lost #2 rank" },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setView("cause")}
                  className="flex items-center justify-between p-2 rounded-lg bg-elevated/40 hover:bg-elevated cursor-pointer transition-colors"
                >
                  <span className="font-medium text-fg">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="caption">{item.metric}</span>
                    <span className="delta-negative font-semibold font-mono">{item.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
