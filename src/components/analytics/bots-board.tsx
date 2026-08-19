import { useMemo, useState } from "react";
import { Bot, User, ShieldCheck, Cpu, Search, AlertCircle } from "lucide-react";
import { PropertyHeader } from "@/components/product/property-header";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { formatPct } from "@/lib/analytics/visitor-name";
import { cn } from "@/lib/utils";

export function BotsBoard() {
  const { events, project } = useRealtime();
  const [filterCategory, setFilterCategory] = useState<"all" | "ai_crawler" | "search_indexer" | "generic_bot">("all");

  const botEvents = useMemo(() => events.filter((e) => e.isBot), [events]);
  const humanEvents = useMemo(() => events.filter((e) => !e.isBot), [events]);

  const total = events.length || 1;
  const botRatio = botEvents.length / total;

  const mockBots = [
    { id: "1", name: "GPTBot (OpenAI Search/Training)", category: "AI Crawler", hits: 1420, rate: "4.8%", status: "Filtered" },
    { id: "2", name: "ClaudeBot (Anthropic Search)", category: "AI Crawler", hits: 890, rate: "3.1%", status: "Filtered" },
    { id: "3", name: "PerplexityBot (Answer Engine)", category: "AI Crawler", hits: 640, rate: "2.2%", status: "Filtered" },
    { id: "4", name: "Googlebot (Desktop Indexer)", category: "Search Indexer", hits: 3410, rate: "11.6%", status: "Filtered" },
    { id: "5", name: "Bingbot (Search Indexer)", category: "Search Indexer", hits: 1120, rate: "3.8%", status: "Filtered" },
    { id: "6", name: "Headless Chrome Scraper", category: "Generic Bot", hits: 320, rate: "1.1%", status: "Blocked" },
  ];

  const columns: Column<typeof mockBots[0]>[] = [
    {
      id: "name",
      header: "Bot Agent & Identification",
      accessor: (r) => r.name,
      cell: (val, r) => (
        <div className="flex items-center gap-2">
          <Bot className="size-3.5 text-muted shrink-0" />
          <div>
            <span className="font-medium text-fg">{val}</span>
            <span className="caption block font-mono text-[10px]">{r.category}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "category",
      header: "Classification",
      accessor: (r) => r.category,
      cell: (val) => (
        <span className="rounded bg-subtle-surface px-2 py-0.5 text-xs font-medium text-muted">
          {val}
        </span>
      ),
      sortable: true,
    },
    {
      id: "hits",
      header: "Intercepted Requests",
      accessor: (r) => r.hits,
      cell: (val) => <span className="font-semibold text-fg tabular-nums">{Number(val).toLocaleString()}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "rate",
      header: "Share of Traffic",
      accessor: (r) => r.rate,
      cell: (val) => <span className="caption font-mono">{val}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "status",
      header: "Isolation Action",
      accessor: (r) => r.status,
      cell: (val) => <StatusBadge status={val === "Blocked" ? "critical" : "healthy"} label={val} size="sm" />,
      align: "center",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-16">
      {/* 1. Property Header */}
      <PropertyHeader
        title="Bot Sentinel — AI & Crawler Isolation"
        subtitle="Automatic detection and exclusion of AI scrapers from core business conversion metrics"
        kpis={[
          { label: "Human Traffic", value: `${(humanEvents.length || 104218).toLocaleString()}`, delta: "91.2%", positive: true },
          { label: "Bot Requests", value: `${(botEvents.length || 24190).toLocaleString()}`, delta: "8.8%", positive: false },
          { label: "AI Scrapers Intercepted", value: "3,150", delta: "Filtered", positive: true },
          { label: "Metrics Integrity", value: "100%", delta: "Clean", positive: true },
        ]}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. Isolation Summary Banner */}
        <div className="rounded-xl border border-positive/30 bg-positive-soft/20 p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-positive shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-fg">Zero-Pollution Guarantee</h4>
            <p className="mt-1 text-muted leading-relaxed">
              Bot and crawler pageviews are segregated at the collector edge. They never inflate your active visitor count, bounce rates, or goal conversions.
            </p>
          </div>
        </div>

        {/* 3. DataTable */}
        <DataTable
          title="Intercepted Bot Agents (Last 28 Days)"
          columns={columns}
          data={mockBots}
          searchPlaceholder="Filter bot agents..."
          searchKey={(r) => `${r.name} ${r.category}`}
        />
      </div>
    </div>
  );
}
