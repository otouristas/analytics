import { PageShell } from "@/components/analytics/page-shell";
import { goalStats } from "@/lib/analytics/goals";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function GoalsBoard() {
  const { people, project } = useRealtime();
  const goals = useMemo(() => goalStats(people), [people]);

  return (
    <PageShell
      kicker={`Goals · ${project.host}`}
      title="What we count as a win"
      dek="Named goals on real paths. No invented euros. Goal / visitor is converted sessions over unique sessions."
    >
      <section className="grid gap-px bg-border sm:grid-cols-3">
        <article className="bg-bg px-5 py-6">
          <p className="kicker">Goal / visitor</p>
          <p className="display-stat mt-2 text-5xl text-fg">{Math.round(goals.perVisitor * 1000) / 10}</p>
          <p className="mt-1 text-xs text-subtle">per 100 sessions</p>
        </article>
        <article className="bg-bg px-5 py-6">
          <p className="kicker">Converted</p>
          <p className="display-stat mt-2 text-5xl text-positive">{goals.converted}</p>
          <p className="mt-1 text-xs text-subtle">sessions that hit a money goal</p>
        </article>
        <article className="bg-bg px-5 py-6">
          <p className="kicker">Sessions</p>
          <p className="display-stat mt-2 text-5xl text-fg">{people.length}</p>
          <p className="mt-1 text-xs text-subtle">this stream</p>
        </article>
      </section>
      <ul>
        {goals.rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm text-fg">{row.name}</p>
              <p className="text-xs text-subtle">{row.hint}</p>
            </div>
            <div className="text-right">
              <p className="display-stat text-2xl text-fg">{row.sessions}</p>
              <p className="text-xs text-subtle">{Math.round(row.rate * 1000) / 10} / 100</p>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
