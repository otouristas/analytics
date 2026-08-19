import { DESTINATIONS } from "./destinations";
import type { LivePerson } from "./realtime";
import { CHANNEL_BY_ID } from "./channels";

export type DemandRow = {
  id: string;
  sessions: number;
  interested: number;
  highIntent: number;
  outbound: number;
  demand: number;
  trend: number;
  mainMarket: string;
  mainChannel: string;
  why: string[];
};

function countMap(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function destinationDemand(people: LivePerson[]): DemandRow[] {
  const half = Math.floor(people.length / 2) || 1;
  const earlier = new Set(people.slice(half).map((person) => person.id));

  const rows: DemandRow[] = [];
  for (const id of DESTINATIONS) {
    const involved = people.filter((person) => person.events.some((event) => event.destinationId === id));
    if (!involved.length) continue;
    const interested = involved.filter((person) =>
      person.events.some(
        (event) =>
          event.destinationId === id &&
          (event.canonicalName === "destination_select" ||
            event.contentType === "guide" ||
            event.contentType === "destination"),
      ),
    ).length;
    const highIntent = involved.filter(
      (person) => person.intentScore >= 20 && person.events.some((event) => event.destinationId === id),
    ).length;
    const outbound = involved.filter((person) =>
      person.events.some((event) => event.destinationId === id && event.canonicalName === "partner_outbound_click"),
    ).length;
    const recent = involved.filter((person) => !earlier.has(person.id)).length;
    const previous = involved.length - recent;
    const demand = Math.round(
      Math.min(
        100,
        (interested / Math.max(1, involved.length)) * 40 +
          (highIntent / Math.max(1, involved.length)) * 35 +
          (outbound / Math.max(1, involved.length)) * 25 +
          Math.min(20, involved.length),
      ),
    );
    const markets = countMap(involved.map((person) => person.countryName));
    const channels = countMap(involved.map((person) => person.source));
    const why = [
      interested ? `Destination interest ${interested} sessions` : "",
      highIntent ? `High intent ${highIntent}` : "",
      outbound ? `Partner outbound ${outbound}` : "",
      recent > previous ? "Rising vs earlier half of this stream" : "",
    ].filter(Boolean);
    rows.push({
      id,
      sessions: involved.length,
      interested,
      highIntent,
      outbound,
      demand,
      trend: previous ? (recent - previous) / previous : recent ? 1 : 0,
      mainMarket: markets[0]?.[0] ?? "—",
      mainChannel: CHANNEL_BY_ID[channels[0]?.[0] ?? ""]?.name ?? channels[0]?.[0] ?? "—",
      why,
    });
  }
  return rows.sort((a, b) => b.demand - a.demand || b.sessions - a.sessions);
}

export function marketDestination(people: LivePerson[]) {
  const markets = [...new Set(people.map((person) => person.countryName).filter(Boolean))].slice(0, 8);
  const islands = DESTINATIONS.filter((id) => people.some((person) => person.events.some((event) => event.destinationId === id))).slice(0, 6);
  return {
    markets,
    islands,
    cells: markets.map((market) =>
      islands.map((island) =>
        people.filter(
          (person) => person.countryName === market && person.events.some((event) => event.destinationId === island),
        ).length,
      ),
    ),
  };
}

export function channelQuality(people: LivePerson[]) {
  const map = new Map<string, { sessions: number; qualified: number; intent: number; outbound: number }>();
  for (const person of people) {
    const id = person.source || "direct";
    const row = map.get(id) ?? { sessions: 0, qualified: 0, intent: 0, outbound: 0 };
    row.sessions += 1;
    if (person.qualified) row.qualified += 1;
    if (person.intentScore >= 35) row.intent += 1;
    if (person.events.some((event) => event.canonicalName === "partner_outbound_click")) row.outbound += 1;
    map.set(id, row);
  }
  return [...map.entries()]
    .map(([id, row]) => ({
      id,
      ...row,
      qualifiedRate: row.sessions ? row.qualified / row.sessions : 0,
      score: Math.round((row.sessions ? (row.qualified / row.sessions) * 70 + (row.outbound / row.sessions) * 30 : 0) * 100),
    }))
    .sort((a, b) => b.qualifiedRate - a.qualifiedRate);
}

export function landingQuality(people: LivePerson[]) {
  const map = new Map<string, { path: string; title: string; entrances: number; qualified: number; intent: number }>();
  for (const person of people) {
    const landing = person.pages[0] || person.path;
    const row = map.get(landing) ?? { path: landing, title: person.title, entrances: 0, qualified: 0, intent: 0 };
    row.entrances += 1;
    if (person.qualified) row.qualified += 1;
    if (person.intentScore >= 35) row.intent += 1;
    map.set(landing, row);
  }
  return [...map.values()]
    .map((row) => ({
      ...row,
      qualifiedRate: row.entrances ? row.qualified / row.entrances : 0,
    }))
    .sort((a, b) => b.entrances - a.entrances);
}
