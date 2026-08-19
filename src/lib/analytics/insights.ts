import { CHANNEL_BY_ID } from "./channels";
import { isConversionEvent, type IngestEvent } from "./ingest";
import type { LivePerson } from "./realtime";

export type StreamWindow = "15m" | "1h" | "24h" | "all";

export const STREAM_WINDOWS: { id: StreamWindow; label: string; ms: number }[] = [
  { id: "15m", label: "Last 15 min", ms: 15 * 60_000 },
  { id: "1h", label: "Last hour", ms: 60 * 60_000 },
  { id: "24h", label: "Last 24 hours", ms: 24 * 60 * 60_000 },
  { id: "all", label: "This stream", ms: Number.POSITIVE_INFINITY },
];

export function windowEvents(events: IngestEvent[], windowId: StreamWindow) {
  const spec = STREAM_WINDOWS.find((item) => item.id === windowId) ?? STREAM_WINDOWS[3]!;
  if (!Number.isFinite(spec.ms)) return events;
  const from = Date.now() - spec.ms;
  return events.filter((event) => event.ts >= from);
}

export function filterEvents(
  events: IngestEvent[],
  filters: { device: string; country: string; channel: string; path?: string },
) {
  const path = filters.path?.trim().toLowerCase();
  return events.filter((event) => {
    if (filters.device !== "all" && event.device !== filters.device) return false;
    if (filters.country && event.countryName !== filters.country && event.countryId !== filters.country)
      return false;
    if (filters.channel !== "all" && event.source !== filters.channel) return false;
    if (path && !`${event.path} ${event.title}`.toLowerCase().includes(path)) return false;
    return true;
  });
}

export function opportunities(people: LivePerson[]) {
  const byPath = new Map<string, { title: string; sessions: number; conversions: number }>();
  for (const person of people) {
    const path = person.path || "/";
    const row = byPath.get(path) ?? { title: person.title || path, sessions: 0, conversions: 0 };
    row.sessions += 1;
    if (person.events.some(isConversionEvent)) row.conversions += 1;
    byPath.set(path, row);
  }
  return [...byPath.entries()]
    .map(([path, row]) => {
      const rate = row.sessions ? row.conversions / row.sessions : 0;
      const kind =
        row.sessions >= 3 && rate === 0
          ? "high-traffic-no-conversion"
          : row.sessions >= 3 && rate < 0.05
            ? "weak-conversion"
            : "watch";
      return { path, ...row, rate, kind };
    })
    .filter((row) => row.kind !== "watch")
    .sort((a, b) => b.sessions - a.sessions);
}

export function funnelCounts(people: LivePerson[], steps: string[]) {
  if (steps.length < 2) return [];
  return steps.map((step) => {
    const users = people.filter((person) => {
      const pages = person.events.filter((event) => event.kind === "pageview").map((event) => event.path);
      return steps.slice(0, steps.indexOf(step) + 1).every((need) => pages.some((page) => matchPath(page, need)));
    }).length;
    return { step, users, drop: Math.max(0, people.length - users) };
  });
}

function matchPath(path: string, step: string) {
  if (step === "/") return path === "/" || path === "/en" || path === "/el";
  return path === step || path.startsWith(step.endsWith("/") ? step : `${step}/`) || path.includes(step);
}

export function attribution(people: LivePerson[]) {
  const first = new Map<string, number>();
  const last = new Map<string, number>();
  for (const person of people) {
    const sources = person.events.map((event) => event.source).filter(Boolean);
    const a = sources[0] || person.source || "direct";
    const b = sources[sources.length - 1] || a;
    first.set(a, (first.get(a) ?? 0) + 1);
    last.set(b, (last.get(b) ?? 0) + 1);
  }
  const names = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([id, value]) => ({ id, name: CHANNEL_BY_ID[id]?.name ?? id, value }))
      .sort((a, b) => b.value - a.value);
  return { first: names(first), last: names(last) };
}

export function coreMetrics(people: LivePerson[]) {
  const visitors = people.length;
  const pageviews = people.reduce(
    (sum, person) => sum + person.events.filter((event) => event.kind === "pageview").length,
    0,
  );
  const bounced = people.filter((person) => {
    const paths = new Set(person.events.filter((event) => event.kind === "pageview").map((event) => event.path));
    return paths.size <= 1;
  }).length;
  const avgDuration = visitors ? people.reduce((sum, person) => sum + person.dwellSec, 0) / visitors : 0;
  const returning = people.filter((person) => person.returning).length;
  const converted = people.filter((person) => person.converted).length;
  const qualified = people.filter((person) => person.qualified).length;
  return {
    visitors,
    pageviews,
    bounce: visitors ? bounced / visitors : 0,
    avgDuration,
    returning,
    fresh: visitors - returning,
    converted,
    qualified,
    goalRate: visitors ? converted / visitors : 0,
    qualifiedRate: visitors ? qualified / visitors : 0,
  };
}

export function pageMetrics(people: LivePerson[]) {
  const map = new Map<
    string,
    { path: string; title: string; visitors: number; views: number; bounced: number; dwell: number }
  >();
  for (const person of people) {
    const views = person.events.filter((event) => event.kind === "pageview");
    const unique = [...new Set(views.map((event) => event.path))];
    for (const event of views) {
      const row = map.get(event.path) ?? {
        path: event.path,
        title: event.title || event.path,
        visitors: 0,
        views: 0,
        bounced: 0,
        dwell: 0,
      };
      row.views += 1;
      map.set(event.path, row);
    }
    for (const path of unique) {
      const row = map.get(path);
      if (!row) continue;
      row.visitors += 1;
      row.dwell += person.dwellSec / Math.max(1, unique.length);
      if (unique.length === 1) row.bounced += 1;
    }
  }
  return [...map.values()]
    .map((row) => ({
      ...row,
      bounce: row.visitors ? row.bounced / row.visitors : 0,
      avgTime: row.visitors ? row.dwell / row.visitors : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);
}

export function sourceMetrics(people: LivePerson[]) {
  const map = new Map<string, { visitors: number; converted: number }>();
  for (const person of people) {
    const id = person.source || "direct";
    const row = map.get(id) ?? { visitors: 0, converted: 0 };
    row.visitors += 1;
    if (person.converted) row.converted += 1;
    map.set(id, row);
  }
  return [...map.entries()]
    .map(([id, row]) => ({
      id,
      ...row,
      rate: row.visitors ? row.converted / row.visitors : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);
}

export function deviceBreak(events: IngestEvent[]) {
  const count = (key: keyof IngestEvent) => {
    const map = new Map<string, number>();
    for (const event of events) {
      const label = String(event[key] || "unknown");
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  return { device: count("device"), os: count("os"), browser: count("browser") };
}

export function vitals(events: IngestEvent[]) {
  const rows = events.filter((event) => event.kind === "vital");
  const parse = (name: string) => {
    const list = rows.filter((event) => event.label.toUpperCase() === name).map((event) => Number(event.query));
    const valid = list.filter((n) => Number.isFinite(n) && n > 0);
    if (!valid.length) return null;
    const avg = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
    return { name, samples: valid.length, avg };
  };
  return [parse("LCP"), parse("INP"), parse("CLS"), parse("TTFB")].filter(Boolean) as {
    name: string;
    samples: number;
    avg: number;
  }[];
}

export function commerce(events: IngestEvent[]) {
  const purchases = events.filter(
    (event) => event.label === "purchase" || (event.kind === "custom" && /purchase|order/i.test(event.label)),
  );
  return { orders: purchases.length, events: purchases.slice(0, 30) };
}

export function alerts(input: {
  live: number;
  people: number;
  conversions: number;
  status: string;
  pages: number;
}) {
  const rows: { level: "healthy" | "watch" | "critical"; title: string; body: string }[] = [];
  if (input.status === "error") {
    rows.push({
      level: "critical",
      title: "Collector unreachable",
      body: "The live feed failed. Analytics still shows the last good stream.",
    });
  } else if (input.status === "empty") {
    rows.push({
      level: "watch",
      title: "No events in this stream",
      body: "Tracking may be blocked, or nobody is on the site.",
    });
  } else {
    rows.push({
      level: "healthy",
      title: "Tracking healthy",
      body: `${input.live} live · ${input.people} sessions in the current window.`,
    });
  }
  if (input.people >= 8 && input.conversions === 0) {
    rows.push({
      level: "watch",
      title: "Sessions without conversions",
      body: "Enough traffic to notice: no booking/outbound/lead events matched.",
    });
  }
  if (input.pages === 0 && input.people > 0) {
    rows.push({
      level: "watch",
      title: "Sessions without pageviews",
      body: "Heartbeats or clicks arrived without a page_view. Check SPA tracking.",
    });
  }
  return rows;
}

export function campaigns(events: IngestEvent[]) {
  const map = new Map<string, number>();
  for (const event of events) {
    const key = event.campaign || event.query || "";
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function rootCause(people: LivePerson[]) {
  const dim = (key: (person: LivePerson) => string) => {
    const sessions = new Map<string, number>();
    const conversions = new Map<string, number>();
    for (const person of people) {
      const id = key(person) || "unknown";
      sessions.set(id, (sessions.get(id) ?? 0) + 1);
      if (person.events.some(isConversionEvent)) conversions.set(id, (conversions.get(id) ?? 0) + 1);
    }
    const total = people.length || 1;
    const convTotal = Math.max(1, [...conversions.values()].reduce((a, b) => a + b, 0));
    return [...sessions.entries()]
      .map(([id, n]) => {
        const c = conversions.get(id) ?? 0;
        return {
          id,
          sessions: n,
          conversions: c,
          sessionShare: n / total,
          conversionShare: c / convTotal,
          rate: n ? c / n : 0,
        };
      })
      .sort((a, b) => b.sessions - a.sessions);
  };
  return {
    source: dim((person) => person.source),
    country: dim((person) => person.countryName),
    device: dim((person) => person.device),
    page: dim((person) => person.path),
  };
}

export function searchTerms(events: IngestEvent[]) {
  const map = new Map<string, number>();
  for (const event of events) {
    const q = event.query.trim().toLowerCase();
    if (!q || q.length < 2) continue;
    map.set(q, (map.get(q) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function trackingHealth(events: IngestEvent[]) {
  const now = Date.now();
  const last = events[0]?.ts ?? 0;
  const pageviews = events.filter((event) => event.kind === "pageview").length;
  const heartbeats = events.filter((event) => event.kind === "heartbeat").length;
  const age = last ? now - last : null;
  const issues: string[] = [];
  if (!events.length) issues.push("No events in this stream.");
  else if (age != null && age > 120_000) issues.push("Last event is older than two minutes.");
  if (events.length > 8 && pageviews === 0) issues.push("Clicks or heartbeats without page_view.");
  if (events.length > 20 && heartbeats === 0)
    issues.push("No heartbeats — tab may be backgrounded or script blocked mid-session.");
  return { ok: issues.length === 0 && events.length > 0, last, age, pageviews, heartbeats, issues };
}

export function minuteSeries(events: IngestEvent[], minutes = 30) {
  const now = Date.now();
  const buckets = Array.from({ length: minutes }, () => 0);
  for (const event of events) {
    if (event.kind === "heartbeat") continue;
    const ago = Math.floor((now - event.ts) / 60_000);
    if (ago >= 0 && ago < minutes) buckets[minutes - 1 - ago] += 1;
  }
  return buckets;
}

export function compareHalves(events: IngestEvent[]) {
  if (events.length < 8) return null;
  const sorted = [...events].sort((a, b) => a.ts - b.ts);
  const mid = sorted[Math.floor(sorted.length / 2)]!.ts;
  const earlier = sorted.filter((event) => event.ts < mid);
  const later = sorted.filter((event) => event.ts >= mid);
  const sessions = (list: IngestEvent[]) => new Set(list.map((event) => event.sessionId)).size;
  const views = (list: IngestEvent[]) => list.filter((event) => event.kind === "pageview").length;
  return {
    earlierSessions: sessions(earlier),
    laterSessions: sessions(later),
    earlierViews: views(earlier),
    laterViews: views(later),
  };
}

export function formsAndScroll(events: IngestEvent[]) {
  const forms = events.filter((event) => event.kind === "form");
  const scrolls = events.filter((event) => event.kind === "scroll");
  const downloads = events.filter((event) => event.kind === "download");
  const depths = [25, 50, 75, 100].map((mark) => ({
    mark,
    value: scrolls.filter((event) => Number(event.label) >= mark).length,
  }));
  return { forms: forms.length, downloads: downloads.length, depths, formRows: forms.slice(0, 20) };
}
