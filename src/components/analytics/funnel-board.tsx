import { funnelCounts } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo, useState } from "react";

const DEFAULT = ["/en", "/en/guides", "/book"];

export function FunnelBoard() {
  const { people, project } = useRealtime();
  const [raw, setRaw] = useState(DEFAULT.join("\n"));
  const steps = useMemo(
    () =>
      raw
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
    [raw],
  );
  const rows = useMemo(() => funnelCounts(people, steps), [people, steps]);
  const first = rows[0]?.users || people.length || 1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Funnels · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Where they drop</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          One path per line. Counts unique sessions in this stream whose pageviews match each step in order.
        </p>
      </section>
      <div className="grid gap-px bg-border lg:grid-cols-[16rem_1fr]">
        <label className="bg-bg p-4 text-xs text-muted">
          Steps
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            className="mt-2 h-40 w-full rounded-md bg-elevated p-3 font-mono text-xs text-fg outline-none"
          />
        </label>
        <ol className="space-y-3 bg-bg p-5">
          {rows.map((row, index) => (
            <li key={row.step}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs text-muted">
                  {index + 1}. {row.step}
                </span>
                <span className="font-mono text-sm tabular-nums text-fg">{row.users}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full bg-map-6"
                  style={{ width: `${Math.max(4, Math.round((row.users / first) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
