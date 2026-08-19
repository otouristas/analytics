import { Button } from "@/components/ui/button";
import { askWorkspace } from "@/lib/analytics/ask";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SUGGESTIONS = [
  "Who is on discovercyclades.gr right now?",
  "Which countries are sending traffic in this stream?",
  "What pages are people actually seeing?",
  "Is anyone coming from ChatGPT, Grok, or Google?",
  "GET /api/agent — JSON for Cursor / Claude (MCP-style)",
];

type Turn = { role: "user" | "assistant"; text: string };

export function QueryBoard() {
  const range = useAnalytics((s) => s.range);
  const { live, people, stats, sources, pages, project } = useRealtime();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setQuestion("");
    setTurns((current) => [...current, { role: "user", text: trimmed }]);
    setBusy(true);
    try {
      const liveSnapshot = JSON.stringify({
        host: project.host,
        live: live.length,
        sessions: people.length,
        pageviews: stats.pageviews,
        clicks: stats.clicks,
        outbound: stats.outbound,
        sources,
        pages: pages.slice(0, 12),
        countries: stats.countries.slice(0, 10),
        devices: stats.devices,
        queries: stats.queries.slice(0, 10),
        now: live.slice(0, 8).map((person) => ({
          city: person.city,
          country: person.countryName,
          path: person.path,
          title: person.title,
          source: person.source,
        })),
      });
      const result = await askWorkspace({ data: { range, question: trimmed, liveSnapshot } });
      setTurns((current) => [...current, { role: "assistant", text: result.text }]);
    } catch {
      setTurns((current) => [
        ...current,
        { role: "assistant", text: "The model could not be reached. Try again." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-5 py-5">
        <p className="kicker">Query</p>
        <h2 className="font-display text-4xl italic tracking-tight text-fg">Ask the stream</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Natural-language questions over real Discover Cyclades traffic. Answers use this live stream, not demo millions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void ask(item)}
              className="rounded-md bg-elevated px-3 py-1.5 text-left text-xs text-muted hover:text-fg"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {turns.length === 0 && (
          <p className="text-sm text-subtle">Pick a question or write your own. Grok only runs when you ask.</p>
        )}
        {turns.map((turn, index) => (
          <article
            key={`${turn.role}-${index}`}
            className={cn("max-w-2xl text-sm leading-relaxed", turn.role === "user" ? "text-muted" : "text-fg")}
          >
            <p className="mb-1 text-xs tracking-wide text-subtle uppercase">
              {turn.role === "user" ? "You" : "Grok"}
            </p>
            <p>{turn.text}</p>
          </article>
        ))}
        {busy && <p className="text-xs text-subtle">Reading the snapshot…</p>}
      </div>

      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about Grok, X, Google, a country, or lost intent"
          className="h-10 flex-1 rounded-md bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle"
        />
        <Button type="submit" disabled={busy || !question.trim()}>
          Ask
        </Button>
      </form>
    </div>
  );
}
