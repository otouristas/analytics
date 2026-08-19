import { PageShell } from "@/components/analytics/page-shell";
import { channelQuality, destinationDemand, landingQuality, marketDestination } from "@/lib/analytics/demand";
import { MODEL_KIND, QUALIFIED_THRESHOLD } from "@/lib/analytics/intent";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { formatPct } from "@/lib/analytics/visitor-name";
import { useMemo } from "react";

export function DemandBoard() {
  const { people, project, live } = useRealtime();
  const demand = useMemo(() => destinationDemand(people), [people]);
  const matrix = useMemo(() => marketDestination(people), [people]);
  const channels = useMemo(() => channelQuality(people), [people]);
  const landings = useMemo(() => landingQuality(people), [people]);
  const qualified = people.filter((person) => person.qualified).length;

  return (
    <PageShell
      kicker={`Destination intelligence · ${project.host}`}
      title="What each market actually wants"
      dek={`${MODEL_KIND} intent model. Qualified = score ≥ ${QUALIFIED_THRESHOLD}. Scores are derived, not LLM.`}
    >
      <section className="grid gap-px bg-border sm:grid-cols-4">
        <Stat label="Sessions" value={String(people.length)} />
        <Stat label="Live" value={String(live.length)} />
        <Stat label="Qualified" value={`${qualified} · ${formatPct(people.length ? qualified / people.length : 0)}`} />
        <Stat label="Islands with signal" value={String(demand.length)} />
      </section>

      <section className="border-b border-border px-5 py-5">
        <h3 className="font-display text-xl italic text-fg">Destination demand</h3>
        <p className="mt-1 text-xs text-subtle">Interest + high intent + outbound. Click why is the breakdown.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle">
              <tr>
                <th className="py-2">Island</th>
                <th className="py-2 text-right">Demand</th>
                <th className="py-2 text-right">Sessions</th>
                <th className="py-2 text-right">Intent</th>
                <th className="py-2 text-right">Outbound</th>
                <th className="py-2">Market</th>
                <th className="py-2">Channel</th>
              </tr>
            </thead>
            <tbody>
              {demand.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-subtle">
                    No destination-tagged sessions in this stream yet.
                  </td>
                </tr>
              )}
              {demand.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 capitalize text-fg">{row.id}</td>
                  <td className="py-3 text-right">
                    <span className="display-stat text-xl">{row.demand}</span>
                  </td>
                  <td className="py-3 text-right font-mono text-xs">{row.sessions}</td>
                  <td className="py-3 text-right font-mono text-xs">{row.highIntent}</td>
                  <td className="py-3 text-right font-mono text-xs">{row.outbound}</td>
                  <td className="py-3 text-xs text-muted">{row.mainMarket}</td>
                  <td className="py-3 text-xs text-muted">{row.mainChannel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {demand[0] && (
          <p className="mt-3 text-xs text-muted">
            Why {demand[0].id} is {demand[0].demand}: {demand[0].why.join(" · ") || "thin sample"}
          </p>
        )}
      </section>

      <section className="border-b border-border px-5 py-5">
        <h3 className="font-display text-xl italic text-fg">Market → island</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-2">Market</th>
                {matrix.islands.map((id) => (
                  <th key={id} className="py-2 capitalize">
                    {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.markets.map((market, i) => (
                <tr key={market} className="border-t border-border">
                  <td className="py-2 text-fg">{market}</td>
                  {matrix.cells[i]?.map((value, j) => (
                    <td key={matrix.islands[j]} className="py-2 font-mono">
                      {value || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-px bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="kicker">Channel quality</h3>
          <ul className="mt-3 space-y-2">
            {channels.slice(0, 8).map((row) => (
              <li key={row.id} className="flex justify-between gap-3 text-sm">
                <span>{CHANNEL_BY_ID[row.id]?.name ?? row.id}</span>
                <span className="font-mono text-xs text-muted">
                  {row.sessions} · {formatPct(row.qualifiedRate)} qualified
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="kicker">Landing quality</h3>
          <ul className="mt-3 space-y-2">
            {landings.slice(0, 8).map((row) => (
              <li key={row.path} className="flex justify-between gap-3 text-sm">
                <span className="truncate">{row.title}</span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {row.entrances} · {formatPct(row.qualifiedRate)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="bg-bg px-5 py-5">
      <p className="kicker">{label}</p>
      <p className="display-stat mt-2 text-3xl text-fg">{value}</p>
    </article>
  );
}
