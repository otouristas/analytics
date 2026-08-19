import type { ReactNode } from "react";
import { ChannelLogo } from "@/components/analytics/channel-logo";
import { VisitorFigure } from "@/components/analytics/visitor-marker";
import { conversionLikelihood } from "@/lib/analytics/goals";
import { ISO2_BY_ID } from "@/lib/analytics/ingest";
import type { LivePerson } from "@/lib/analytics/realtime";
import { flagEmoji, formatDwell } from "@/lib/analytics/visitor-name";
import { Chrome, Globe, Monitor, Smartphone, X } from "lucide-react";

export function VisitorCard({
  person,
  people,
  onClose,
}: {
  person: LivePerson;
  people: LivePerson[];
  onClose: () => void;
}) {
  const chance = conversionLikelihood(person.events, person.dwellSec);
  const avg =
    people.reduce((sum, item) => sum + conversionLikelihood(item.events, item.dwellSec), 0) /
    Math.max(1, people.length);
  const delta = Math.round((chance - avg) * 100);
  const iso = ISO2_BY_ID[person.countryId] ?? "";
  const visits = Math.max(1, person.events.filter((event) => event.kind === "pageview").length);

  return (
    <div className="glass-strong w-80 overflow-hidden rounded-2xl p-4 text-sm">
      <div className="flex items-start gap-3">
        <VisitorFigure personId={person.id} device={person.device} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg">{person.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>
              {flagEmoji(iso)} {person.city}
              {person.countryName && person.city !== person.countryName ? `, ${person.countryName}` : ""}
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              {person.device === "mobile" ? <Smartphone className="size-3" /> : <Monitor className="size-3" />}
              {person.device === "mobile" ? "Mobile" : "Desktop"}
            </span>
            <span>{person.os || "—"}</span>
            <span className="inline-flex items-center gap-1">
              {/chrome/i.test(person.browser) ? <Chrome className="size-3" /> : <Globe className="size-3" />}
              {person.browser || "—"}
            </span>
          </p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="text-subtle hover:text-fg">
          <X className="size-4" />
        </button>
      </div>

      <dl className="mt-4 space-y-2 text-xs">
        <Row label="Referrer">
          <span className="inline-flex items-center gap-1.5">
            <ChannelLogo id={person.source} size="sm" />
            {person.source}
          </span>
        </Row>
        <Row label="Current URL">{person.path}</Row>
        <Row label="Session time">{formatDwell(person.dwellSec)}</Row>
        <Row label="Total visits">{String(visits)}</Row>
      </dl>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Conversion likelihood</span>
          <span className={delta >= 0 ? "text-positive" : "text-danger"}>
            {delta >= 0 ? "+" : ""}
            {delta}% vs avg
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
          <div className="h-full rounded-full bg-map-6" style={{ width: `${Math.round(chance * 100)}%` }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">Estimated value</span>
        <span className="text-fg">$0</span>
      </div>
      <p className="mt-1 text-xs text-subtle">No payments connected. Likelihood is from named goals, not invented revenue.</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate font-mono text-fg">{children}</dd>
    </div>
  );
}
