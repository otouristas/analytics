import { useMemo, useState } from "react";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { Bot, User, ShieldCheck, Cpu, Search, AlertCircle } from "lucide-react";
import { formatPct } from "@/lib/analytics/visitor-name";
import { cn } from "@/lib/utils";

export function BotsBoard() {
  const { events, project } = useRealtime();
  const [filterCategory, setFilterCategory] = useState<"all" | "ai_crawler" | "search_indexer" | "generic_bot">("all");

  const botEvents = useMemo(() => events.filter((e) => e.isBot), [events]);
  const humanEvents = useMemo(() => events.filter((e) => !e.isBot), [events]);

  const total = events.length || 1;
  const botRatio = botEvents.length / total;

  const botStats = useMemo(() => {
    const counts = new Map<string, { count: number; name: string; category: string; paths: Set<string> }>();

    for (const e of botEvents) {
      const type = e.botType || "suspected";
      const cur = counts.get(type) ?? {
        count: 0,
        name: type,
        category:
          type.includes("Bot") || type.includes("Spider")
            ? "ai_crawler"
            : type.includes("Google") || type.includes("Bing")
              ? "search_indexer"
              : "generic_bot",
        paths: new Set(),
      };
      cur.count++;
      cur.paths.add(e.path);
      counts.set(type, cur);
    }

    return [...counts.values()].sort((a, b) => b.count - a.count);
  }, [botEvents]);

  const filteredBots = useMemo(() => {
    if (filterCategory === "all") return botStats;
    return botStats.filter((b) => b.category === filterCategory);
  }, [botStats, filterCategory]);

  return (
    <PageShell
      kicker={`Bot Sentinel · ${project.host}`}
      title="Bot &amp; AI Crawler Traffic"
      dek="Real-time detection and isolation of AI web scrapers (OpenAI, Anthropic, Perplexity) and search indexers. Bots are strictly excluded from destination demand, live user counts, and conversion metrics."
    >
      {/* Overview Stat Strip */}
      <section className="grid gap-px bg-border sm:grid-cols-4">
        <article className="bg-bg p-5">
          <p className="kicker">Human Sessions</p>
          <div className="mt-2 flex items-center gap-2">
            <User className="size-5 text-positive" />
            <span className="display-stat text-3xl text-fg">{humanEvents.length}</span>
          </div>
          <p className="mt-1 text-xs text-subtle">{formatPct(1 - botRatio)} of all event traffic</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Bot Ingests Blocked</p>
          <div className="mt-2 flex items-center gap-2">
            <Bot className="size-5 text-amber-400" />
            <span className="display-stat text-3xl text-amber-400">{botEvents.length}</span>
          </div>
          <p className="mt-1 text-xs text-subtle">{formatPct(botRatio)} isolated from KPIs</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">AI LLM Crawlers</p>
          <div className="mt-2 flex items-center gap-2">
            <Cpu className="size-5 text-fg" />
            <span className="display-stat text-3xl text-fg">
              {botEvents.filter((e) => ["GPTBot", "ClaudeBot", "PerplexityBot", "Bytespider", "CCBot"].includes(e.botType || "")).length}
            </span>
          </div>
          <p className="mt-1 text-xs text-subtle">knowledge ingestion sweeps</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Search Indexers</p>
          <div className="mt-2 flex items-center gap-2">
            <Search className="size-5 text-fg" />
            <span className="display-stat text-3xl text-fg">
              {botEvents.filter((e) => ["Googlebot", "GoogleOther", "Applebot", "Bingbot"].includes(e.botType || "")).length}
            </span>
          </div>
          <p className="mt-1 text-xs text-subtle">SERP refresh crawls</p>
        </article>
      </section>

      {/* Filter Tabs */}
      <section className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-xs text-muted">Crawler category:</span>
        {(["all", "ai_crawler", "search_indexer", "generic_bot"] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              filterCategory === cat ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            {cat === "all" ? "All Agents" : cat === "ai_crawler" ? "AI Crawlers" : cat === "search_indexer" ? "Search Indexers" : "Automated Scrapers"}
          </button>
        ))}
      </section>

      {/* Crawler List */}
      <section className="p-5">
        <h3 className="font-display text-xl italic text-fg">Identified Crawler Signatures</h3>
        <p className="mt-1 text-xs text-subtle">
          Parsed from HTTP `User-Agent` headers and verified against authoritative IP ranges.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle border-b border-border">
              <tr>
                <th className="py-2.5">Agent Signature</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Hit Count</th>
                <th className="py-2.5 text-right">Target Pages</th>
                <th className="py-2.5 text-right">Isolation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBots.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-subtle">
                    <ShieldCheck className="mx-auto size-8 text-positive/60 mb-2" />
                    No automated crawler requests captured in the current stream buffer.
                  </td>
                </tr>
              )}
              {filteredBots.map((bot) => (
                <tr key={bot.name} className="hover:bg-surface/30">
                  <td className="py-3 font-mono font-medium text-fg">{bot.name}</td>
                  <td className="py-3 capitalize text-xs text-muted">
                    {bot.category === "ai_crawler" ? "AI Model Scraper" : bot.category === "search_indexer" ? "Search Indexer" : "Generic Bot"}
                  </td>
                  <td className="py-3 text-right font-mono text-sm font-semibold text-fg">{bot.count}</td>
                  <td className="py-3 text-right font-mono text-xs text-subtle">{bot.paths.size} unique URL(s)</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-positive/10 px-2 py-0.5 text-xs text-positive font-medium">
                      <ShieldCheck className="size-3" /> Isolated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture Notice */}
      <section className="p-5">
        <div className="rounded-xl bg-elevated p-4">
          <p className="kicker">Crawler Quarantine Protocol</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Meridian classifies User-Agents at ingest time. Any hit tagged with an AI bot signature (such as <code className="text-fg">GPTBot</code> or <code className="text-fg">ClaudeBot</code>) is safely recorded for indexing visibility but completely excluded from human engagement metrics, bounce rate, and live visitor pins.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
