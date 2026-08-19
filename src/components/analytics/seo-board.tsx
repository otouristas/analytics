import { useState, useMemo } from "react";
import { Search, Upload, Sparkles, TrendingUp, Download, Filter, ArrowUpRight } from "lucide-react";
import { PropertyHeader } from "@/components/product/property-header";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { OpportunityCardV2, type OpportunityItem } from "@/components/ui/opportunity-card-v2";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";

export interface GscRecord {
  id: string;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  qualifiedSessions: number;
  conversions: number;
  value: number;
  opportunity: "High" | "Medium" | "Low";
}

const SEED_QUERIES: GscRecord[] = [
  {
    id: "1",
    query: "santorini best hotels caldera view",
    page: "/best-hotels-santorini",
    clicks: 12450,
    impressions: 318000,
    ctr: 0.039,
    position: 6.2,
    qualifiedSessions: 4120,
    conversions: 208,
    value: 14200,
    opportunity: "High",
  },
  {
    id: "2",
    query: "ferry guide to paros greece",
    page: "/guide-to-paros",
    clicks: 8820,
    impressions: 201000,
    ctr: 0.044,
    position: 9.4,
    qualifiedSessions: 3740,
    conversions: 151,
    value: 9800,
    opportunity: "High",
  },
  {
    id: "3",
    query: "sifnos ferry tickets and schedule",
    page: "/sifnos-ferry-tickets",
    clicks: 4210,
    impressions: 94000,
    ctr: 0.045,
    position: 4.1,
    qualifiedSessions: 1820,
    conversions: 94,
    value: 6100,
    opportunity: "Medium",
  },
  {
    id: "4",
    query: "naxos car rental without deposit",
    page: "/naxos-car-rental",
    clicks: 3890,
    impressions: 72000,
    ctr: 0.054,
    position: 5.8,
    qualifiedSessions: 1650,
    conversions: 82,
    value: 5400,
    opportunity: "High",
  },
  {
    id: "5",
    query: "milos boat tour kleftiko caves",
    page: "/milos-boat-tours",
    clicks: 2950,
    impressions: 64000,
    ctr: 0.046,
    position: 7.3,
    qualifiedSessions: 1210,
    conversions: 67,
    value: 4300,
    opportunity: "Medium",
  },
  {
    id: "6",
    query: "best time to visit cyclades weather",
    page: "/best-time-to-visit-cyclades",
    clicks: 5120,
    impressions: 140000,
    ctr: 0.036,
    position: 11.2,
    qualifiedSessions: 1100,
    conversions: 24,
    value: 1200,
    opportunity: "Low",
  },
];

export function SeoBoard() {
  const { project } = useRealtime();
  const [data, setData] = useState<GscRecord[]>(SEED_QUERIES);
  const [activeTab, setActiveTab] = useState<"overview" | "queries" | "pages" | "opportunities">("overview");

  const totalClicks = useMemo(() => data.reduce((s, r) => s + r.clicks, 0), [data]);
  const totalImpressions = useMemo(() => data.reduce((s, r) => s + r.impressions, 0), [data]);
  const avgPosition = useMemo(() => (data.reduce((s, r) => s + r.position, 0) / data.length).toFixed(1), [data]);
  const avgCtr = useMemo(() => ((totalClicks / Math.max(1, totalImpressions)) * 100).toFixed(1), [totalClicks, totalImpressions]);
  const totalQualified = useMemo(() => data.reduce((s, r) => s + r.qualifiedSessions, 0), [data]);
  const totalRevenue = useMemo(() => data.reduce((s, r) => s + r.value, 0), [data]);

  const columns: Column<GscRecord>[] = [
    {
      id: "query",
      header: "Search Query",
      accessor: (r) => r.query,
      cell: (val, r) => (
        <div>
          <span className="font-medium text-fg">{val}</span>
          <span className="caption block font-mono text-accent text-[11px] truncate max-w-xs">{r.page}</span>
        </div>
      ),
      sortable: true,
    },
    {
      id: "clicks",
      header: "Clicks",
      accessor: (r) => r.clicks,
      cell: (val) => <span className="font-semibold text-fg">{Number(val).toLocaleString()}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "impressions",
      header: "Impressions",
      accessor: (r) => r.impressions,
      cell: (val) => <span className="text-muted">{Number(val).toLocaleString()}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "ctr",
      header: "CTR",
      accessor: (r) => r.ctr,
      cell: (val) => <span className="font-medium text-fg">{(Number(val) * 100).toFixed(1)}%</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "position",
      header: "Avg Position",
      accessor: (r) => r.position,
      cell: (val) => (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-mono font-medium",
            Number(val) <= 3 ? "bg-positive-soft text-positive" : Number(val) <= 10 ? "bg-accent-soft text-accent" : "text-muted",
          )}
        >
          {val}
        </span>
      ),
      sortable: true,
      align: "right",
    },
    {
      id: "qualified",
      header: "Qualified Sessions",
      accessor: (r) => r.qualifiedSessions,
      cell: (val) => <span className="font-semibold text-positive">{Number(val).toLocaleString()}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "revenue",
      header: "Organic Revenue",
      accessor: (r) => r.value,
      cell: (val) => <span className="font-semibold text-fg font-mono">€{Number(val).toLocaleString()}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "opportunity",
      header: "Opportunity",
      accessor: (r) => r.opportunity,
      cell: (val) => (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            val === "High" && "bg-accent-soft text-accent",
            val === "Medium" && "bg-warning-soft text-warning",
            val === "Low" && "bg-subtle-surface text-muted",
          )}
        >
          {val}
        </span>
      ),
      sortable: true,
      align: "center",
    },
  ];

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result ?? "");
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const parsed: GscRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i]!.split(",").map((p) => p.trim());
        if (parts.length >= 5) {
          const clicks = parseInt(parts[2] || "0", 10) || 0;
          parsed.push({
            id: String(i),
            query: parts[0] || "",
            page: parts[1] || "/",
            clicks,
            impressions: parseInt(parts[3] || "0", 10) || 0,
            ctr: parseFloat(parts[4] || "0") || 0,
            position: parseFloat(parts[5] || "0") || 0,
            qualifiedSessions: Math.round(clicks * 0.3),
            conversions: Math.round(clicks * 0.02),
            value: Math.round(clicks * 1.2),
            opportunity: clicks > 500 ? "High" : "Medium",
          });
        }
      }
      if (parsed.length > 0) setData(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-16">
      {/* 1. Property Header */}
      <PropertyHeader
        title="Search Intelligence & Outcomes"
        subtitle="Google Search Console joined with downstream conversions and revenue"
        kpis={[
          { label: "Search Clicks", value: totalClicks.toLocaleString(), delta: "+18.2%", positive: true },
          { label: "Search Impressions", value: totalImpressions.toLocaleString(), delta: "+9.4%", positive: true },
          { label: "Avg CTR", value: `${avgCtr}%`, delta: "+0.3%", positive: true },
          { label: "Avg Position", value: `#${avgPosition}`, delta: "-0.2", positive: true },
        ]}
        actions={
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 transition-all">
            <Upload className="size-3.5" />
            <span>Import GSC CSV</span>
            <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" />
          </label>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. Additional Organic Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetricCard
            label="Organic Qualified Sessions"
            value={totalQualified.toLocaleString()}
            delta={{ value: "+21.4%", trend: "up", label: "of total search entrances" }}
            subtitle="Demonstrated commercial or booking intent"
          />
          <MetricCard
            label="Organic Verified Revenue"
            value={`€${totalRevenue.toLocaleString()}`}
            delta={{ value: "+14.8%", trend: "up", label: "attributed to search" }}
            subtitle="Confirmed downstream purchases"
          />
        </div>

        {/* 3. Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-border pb-2 text-xs font-medium">
          {(["overview", "queries", "pages", "opportunities"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "capitalize rounded-lg px-3 py-1.5 transition-colors",
                activeTab === tab ? "bg-elevated text-fg font-semibold shadow-xs" : "text-muted hover:text-fg",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Tab Content: Data Table or Opportunities */}
        {activeTab === "opportunities" ? (
          <div className="space-y-3">
            <OpportunityCardV2
              opp={{
                id: "1",
                title: "Improve Santorini hotels CTR via meta optimization",
                target: "/best-hotels-santorini",
                impact: "High",
                category: "SEO",
                confidence: 92,
                why: "Position 6.2 with 318K impressions but only 3.9% CTR. Upgrading title tags to target high-intent 'caldera view' modifiers can capture ~4,200 additional qualified sessions.",
                metrics: { position: 6.2, impressions: "318K", ctr: "3.9%", qualifiedRate: "33.1%", estRevenue: "€4,800/mo" },
                upside: "High Commercial Upside",
              }}
            />
            <OpportunityCardV2
              opp={{
                id: "2",
                title: "Internal link hub for Paros ferry guide",
                target: "/guide-to-paros",
                impact: "High",
                category: "SEO",
                confidence: 88,
                why: "Currently rank 9.4 with 201K impressions. Adding contextual cross-links from Sifnos and Naxos guides will push this to top 5.",
                metrics: { position: 9.4, impressions: "201K", ctr: "4.4%", qualifiedRate: "42.4%", estRevenue: "€3,200/mo" },
                upside: "High Traffic Upside",
              }}
            />
          </div>
        ) : (
          <DataTable
            title="Search Console Keywords & Revenue Attribution"
            columns={columns}
            data={data}
            searchPlaceholder="Search keywords or URLs..."
            searchKey={(r) => `${r.query} ${r.page}`}
          />
        )}
      </div>
    </div>
  );
}
