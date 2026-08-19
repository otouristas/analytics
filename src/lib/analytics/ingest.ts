import { classifySource } from "./channels";
import { COUNTRIES } from "./countries";
import { isMoneyEvent } from "./goals";

export type EventKind =
  | "pageview"
  | "click"
  | "outbound"
  | "heartbeat"
  | "exit"
  | "custom"
  | "vital"
  | "scroll"
  | "form"
  | "download"
  | "rage_click"
  | "error"
  | "conversion"
  | "identify";

export type IngestEvent = {
  id: string;
  ts: number;
  writeKey: string;
  sessionId: string;
  kind: EventKind;
  host: string;
  path: string;
  title: string;
  fromPath: string;
  href: string;
  label: string;
  source: string;
  referrer: string;
  query: string;
  countryId: string;
  countryName: string;
  city: string;
  device: "desktop" | "mobile";
  os: string;
  browser: string;
  campaign: string;
  medium: string;
  name: string;
  initials: string;
  isBot?: boolean;
  botType?: string;
  valueType?: "confirmed" | "estimated";
  amountCents?: number;
  currency?: string;
  props?: Record<string, unknown>;
  canonicalName?: import("./canonicalize").CanonicalName;
  intentStage?: import("./canonicalize").IntentStage;
  destinationId?: string;
  contentType?: string;
  partnerType?: string;
  rawEventName?: string;
};

export const DEMO_WRITE_KEY = "mk_live_demo";
export const CYCLADES_WRITE_KEY = "mk_cyclades";

const MAX = 400;

const globalRef = globalThis as typeof globalThis & {
  __meridianEvents__?: IngestEvent[];
};

function store(): IngestEvent[] {
  if (!globalRef.__meridianEvents__) globalRef.__meridianEvents__ = [];
  return globalRef.__meridianEvents__;
}

function uid() {
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function listEvents(after = 0): IngestEvent[] {
  return store().filter((event) => event.ts > after);
}

const ISO2: Record<string, string> = {
  US: "840",
  GB: "826",
  DE: "276",
  FR: "250",
  IT: "380",
  ES: "724",
  NL: "528",
  GR: "300",
  BE: "056",
  AT: "040",
  AU: "036",
  CA: "124",
  JP: "392",
  KR: "410",
  IN: "356",
  BR: "076",
  MX: "484",
  IL: "376",
  AE: "784",
  SG: "702",
  PL: "616",
  SE: "752",
  PT: "620",
  IE: "372",
  TR: "792",
  CN: "156",
  CY: "196",
  CH: "756",
  NO: "578",
  DK: "208",
};

export function countryFromIso2(code?: string | null) {
  if (!code) return undefined;
  return COUNTRIES.find((item) => item.id === ISO2[code.toUpperCase()]);
}

export function ingestEvent(input: Partial<IngestEvent> & { path?: string }): IngestEvent {
  const country =
    COUNTRIES.find((item) => item.id === input.countryId) ??
    COUNTRIES.find((item) => item.name === input.countryName) ??
    COUNTRIES.find((item) => item.id === "300") ??
    COUNTRIES.find((item) => item.id === "840")!;
  const source = classifySource(input.source || "direct", input.referrer || "", input.campaign || "");
  const name = input.name?.trim() || "Visitor";
  const event: IngestEvent = {
    id: input.id ?? uid(),
    ts: input.ts ?? Date.now(),
    writeKey: input.writeKey || DEMO_WRITE_KEY,
    sessionId: input.sessionId || uid(),
    kind: input.kind ?? "pageview",
    host: input.host || "",
    path: input.path || "/",
    title: input.title || input.path || "Page",
    fromPath: input.fromPath || "",
    href: input.href || "",
    label: input.label || "",
    source,
    referrer: input.referrer || "",
    query: input.query || "",
    countryId: country.id,
    countryName: country.name,
    city: input.city || "—",
    device: input.device === "mobile" ? "mobile" : "desktop",
    os: input.os || "",
    browser: input.browser || "",
    campaign: input.campaign || "",
    medium: input.medium || "",
    name,
    initials: input.initials || initialsFrom(name),
    isBot: input.isBot ?? false,
    botType: input.botType || (input.isBot ? "generic_bot" : "human"),
    valueType: input.valueType,
    amountCents: input.amountCents,
    currency: input.currency || "EUR",
    props: input.props,
  };
  const events = store();
  events.unshift(event);
  if (events.length > MAX) events.length = MAX;
  return event;
}

function initialsFrom(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "V"}${parts[1]?.[0] ?? "S"}`.toUpperCase();
}

export const ISO2_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ISO2).map(([iso, id]) => [id, iso]),
);

export function isValidKey(key: string | null | undefined) {
  if (!key) return false;
  return key === DEMO_WRITE_KEY || key === CYCLADES_WRITE_KEY || key.startsWith("mk_");
}

export function isConversionEvent(event: IngestEvent) {
  return isMoneyEvent(event) || event.kind === "conversion" || (event.kind === "custom" && /purchase|convert|signup|lead|subscribe|booked/i.test(event.label));
}

export function summarize(events: IngestEvent[]) {
  const now = Date.now();
  const liveCutoff = now - 60_000;
  
  // Separate humans vs bots
  const humanEvents = events.filter((e) => !e.isBot);
  const botEvents = events.filter((e) => e.isBot);

  const liveSessions = new Set(
    humanEvents.filter((event) => event.ts >= liveCutoff && event.kind !== "exit").map((event) => event.sessionId),
  );
  const pageviews = humanEvents.filter((event) => event.kind === "pageview");
  const clicks = humanEvents.filter((event) => event.kind === "click" || event.kind === "outbound" || event.kind === "rage_click");
  const outbound = humanEvents.filter((event) => event.kind === "outbound");
  const internal = humanEvents.filter((event) => event.kind === "click");
  const exits = humanEvents.filter((event) => event.kind === "exit");
  const rageClicks = humanEvents.filter((event) => event.kind === "rage_click");
  const errors = humanEvents.filter((event) => event.kind === "error");
  const conversions = humanEvents.filter(isConversionEvent);

  const confirmedRevenueCents = events
    .filter((e) => e.valueType === "confirmed")
    .reduce((sum, e) => sum + (e.amountCents ?? 0), 0);

  const estimatedRevenueCents = events
    .filter((e) => e.valueType === "estimated")
    .reduce((sum, e) => sum + (e.amountCents ?? 0), 0);

  const count = (items: string[]) => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (!item) continue;
      map.set(item, (map.get(item) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  const bySession = new Map<string, IngestEvent[]>();
  for (const event of [...humanEvents].reverse()) {
    const list = bySession.get(event.sessionId) ?? [];
    list.push(event);
    bySession.set(event.sessionId, list);
  }

  const journeys = [...bySession.values()].map((list) => {
    const pages = list.filter((event) => event.kind === "pageview").map((event) => event.path);
    const last = list[list.length - 1];
    return {
      sessionId: list[0]?.sessionId ?? "",
      pages: pages.length ? pages : [list[0]?.path ?? "/"],
      source: list[0]?.source ?? "direct",
      country: list[0]?.countryName ?? "",
      device: list[0]?.device ?? "desktop",
      city: list[0]?.city ?? "—",
      exited: last?.kind === "exit" || Boolean(last?.href),
      exitHref: last?.href,
    };
  });

  const flows = count(
    journeys.flatMap((j) => {
      const out: string[] = [];
      for (let i = 0; i < j.pages.length - 1; i += 1) {
        out.push(`${j.pages[i]} → ${j.pages[i + 1]}`);
      }
      return out;
    }),
  );

  return {
    live: liveSessions.size,
    pageviews: pageviews.length,
    clicks: clicks.length,
    outbound: outbound.length,
    internal: internal.length,
    exits: exits.length,
    rageClicks: rageClicks.length,
    errors: errors.length,
    conversions: conversions.length,
    confirmedRevenueCents,
    estimatedRevenueCents,
    botEventsCount: botEvents.length,
    botTypes: count(botEvents.map((e) => e.botType || "suspected")),
    sources: count(humanEvents.map((e) => e.source)),
    countries: count(humanEvents.map((e) => e.countryName)),
    devices: count(humanEvents.map((e) => e.device)),
    landings: count(journeys.map((j) => j.pages[0] || "/")),
    exitPages: count(journeys.map((j) => j.pages[j.pages.length - 1] || "/")),
    clickLabels: count(clicks.map((e) => e.label || e.href || e.path)),
    outboundHrefs: count(outbound.map((e) => e.href || e.label)),
    queries: count(humanEvents.map((e) => e.query)),
    flows,
    journeys,
  };
}
