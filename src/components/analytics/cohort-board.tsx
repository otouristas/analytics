import { attribution } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function CohortBoard() {
  const { people, project } = useRealtime();
  const attr = useMemo(() => attribution(people), [people]);
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const person of people) {
      const key = person.source || "direct";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [people]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Cohorts · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">First touch in this stream</h2>
        <p className="mt-1 text-sm text-muted">
          Day-N retention needs warehouse history. Here: first-touch vs last-touch source for sessions we actually have.
        </p>
      </section>
      <section className="grid gap-px bg-border lg:grid-cols-2">
        <Col title="First touch" rows={attr.first.map((row) => ({ label: row.name, value: row.value }))} />
        <Col title="Last touch" rows={attr.last.map((row) => ({ label: row.name, value: row.value }))} />
      </section>
      <section className="px-5 py-5">
        <h3 className="kicker">Acquisition cohort size</h3>
        <ul className="mt-3 space-y-2">
          {buckets.map(([id, value]) => (
            <li key={id} className="flex justify-between text-sm">
              <span>{id}</span>
              <span className="font-mono text-xs tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Col({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <article className="bg-bg p-5">
      <h3 className="kicker">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between text-sm">
            <span>{row.label}</span>
            <span className="font-mono text-xs tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
