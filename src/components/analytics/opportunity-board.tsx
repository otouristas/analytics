import { opportunities } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function OpportunityBoard() {
  const { people, project } = useRealtime();
  const rows = useMemo(() => opportunities(people), [people]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Opportunities · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">High traffic, weak conversion</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Only pages with enough sessions in this stream. Impact is session volume, not invented euros.
        </p>
      </section>
      <ul>
        {rows.length === 0 && (
          <li className="px-5 py-10 text-sm text-subtle">Need more sessions on a page before we flag it.</li>
        )}
        {rows.map((row) => (
          <li key={row.path} className="border-b border-border px-5 py-4">
            <p className="kicker">{row.kind.replace(/-/g, " ")}</p>
            <p className="mt-1 text-fg">{row.title}</p>
            <p className="font-mono text-xs text-muted">{row.path}</p>
            <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
              {row.sessions} sessions · {row.conversions} conversions · {Math.round(row.rate * 1000) / 10}%
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
