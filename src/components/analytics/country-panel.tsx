import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCountry } from "@/lib/analytics/countries";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useAnalytics } from "@/lib/analytics/store";
import { VisitorAvatar } from "@/components/analytics/visitor-marker";

export function CountryPanel() {
  const selectedId = useAnalytics((s) => s.selectedId);
  const setSelectedId = useAnalytics((s) => s.setSelectedId);
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const setView = useAnalytics((s) => s.setView);
  const country = selectedId ? getCountry(selectedId) : undefined;
  const { live, people, byCountry, sources } = useRealtime();
  const here = people.filter((person) => (country ? person.countryId === country.id : true));
  const onSite = live.filter((person) => (country ? person.countryId === country.id : true));
  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <aside className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">{country ? country.region : "Worldwide"}</p>
          <h2 className="font-display text-3xl italic leading-none tracking-tight text-fg">
            {country ? country.name : "Presence"}
          </h2>
          <p className="mt-1 font-mono text-xs text-subtle">
            {onSite.length} on site now · {here.length} in this stream
          </p>
        </div>
        {country && (
          <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelectedId(null)}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div>
        <p className="text-xs text-muted">Live now</p>
        <p className="font-mono text-3xl tracking-tight text-fg tabular-nums">{onSite.length}</p>
      </div>

      <div>
        <p className="mb-2 text-xs tracking-wide text-muted uppercase">{country ? "People" : "On the map"}</p>
        <ul className="space-y-3">
          {(country ? here : live).slice(0, 8).map((person) => (
            <li key={person.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 text-left"
                onClick={() => {
                  setSessionId(person.id);
                  setView("live");
                }}
              >
                <VisitorAvatar person={person} live={onSite.some((item) => item.id === person.id)} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-fg">{person.city}</span>
                  <span className="block truncate text-xs text-muted">
                    {CHANNEL_BY_ID[person.source]?.name ?? person.source} · {person.title}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {(country ? here : live).length === 0 && (
            <li className="text-sm text-subtle">No visitors here yet.</li>
          )}
        </ul>
      </div>

      {!country && (
        <div>
          <p className="mb-2 text-xs tracking-wide text-muted uppercase">Countries</p>
          <ul className="space-y-2">
            {topCountries.map(([id, count]) => (
              <li key={id} className="flex justify-between text-xs">
                <button type="button" className="text-fg" onClick={() => setSelectedId(id)}>
                  {getCountry(id)?.name ?? id}
                </button>
                <span className="font-mono tabular-nums text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs tracking-wide text-muted uppercase">Sources</p>
        <ul className="space-y-1.5">
          {sources.slice(0, 5).map(([id, count]) => (
            <li key={id} className="flex justify-between text-xs">
              <span className="text-fg">{CHANNEL_BY_ID[id]?.name ?? id}</span>
              <span className="font-mono tabular-nums text-muted">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
