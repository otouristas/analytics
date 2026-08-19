import { CHANNEL_BY_ID, classifySource } from "./channels";
import { canonicalize } from "./canonicalize";
import { intentScore, isQualified } from "./intent";
import { visitorName } from "./visitor-name";
import { isMoneyEvent } from "./goals";
import { COUNTRIES } from "./countries";
import { countryFromIso2, type IngestEvent } from "./ingest";
import type { LiveSession } from "./sessions";

export function personaOf(id: string): "girl" | "boy" {
  let n = 0;
  for (const char of id) n += char.charCodeAt(0);
  return n % 2 === 0 ? "girl" : "boy";
}

const LANG: Record<string, string> = {
  en: "English",
  el: "Greek",
  gr: "Greek",
  ru: "Russian",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  nl: "Dutch",
  zh: "Chinese",
  pt: "Portuguese",
};

const ISO_NAME: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  GR: "Greece",
  BE: "Belgium",
  AT: "Austria",
  AU: "Australia",
  CA: "Canada",
  JP: "Japan",
  IN: "India",
  BR: "Brazil",
  CN: "China",
  KR: "South Korea",
  IL: "Israel",
  AE: "United Arab Emirates",
  PL: "Poland",
  SE: "Sweden",
  PT: "Portugal",
  IE: "Ireland",
  TR: "Turkey",
  CH: "Switzerland",
  CY: "Cyprus",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CZ: "Czechia",
  RO: "Romania",
  HU: "Hungary",
  BG: "Bulgaria",
  RS: "Serbia",
  UA: "Ukraine",
  RU: "Russia",
  MX: "Mexico",
  AR: "Argentina",
  ZA: "South Africa",
  EG: "Egypt",
  SA: "Saudi Arabia",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  NZ: "New Zealand",
  TH: "Thailand",
};

export type LivePerson = LiveSession & {
  sessionId: string;
  path: string;
  title: string;
  lang: string;
  browser: string;
  os: string;
  source: string;
  lastTs: number;
  events: IngestEvent[];
  persona: "girl" | "boy";
  intentScore: number;
  qualified: boolean;
};

export function languageOf(path: string) {
  const code = path.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  return LANG[code] ?? "English";
}

export function prettyTitle(title: string, path: string) {
  const cleaned = title.replace(/\s*[·|].*discovercyclades.*/i, "").trim();
  if (cleaned) return cleaned;
  const parts = path.split("/").filter(Boolean).slice(1);
  if (!parts.length) return "Home";
  return parts[parts.length - 1]!.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function prettyPath(path: string) {
  return path || "/";
}

export function normalizeEvent(raw: IngestEvent): IngestEvent {
  const isoGuess =
    (raw.countryId && raw.countryId.length === 2 ? raw.countryId : "") ||
    (raw.countryName && raw.countryName.length === 2 ? raw.countryName : "");
  const country =
    countryFromIso2(isoGuess) ??
    COUNTRIES.find((item) => item.id === raw.countryId) ??
    COUNTRIES.find((item) => item.name === raw.countryName) ??
    COUNTRIES.find((item) => item.name === ISO_NAME[isoGuess.toUpperCase()]);
  const sourceRaw = (raw.source || "direct").toLowerCase();
  const source = CHANNEL_BY_ID[sourceRaw] ? sourceRaw : classifySource(sourceRaw, raw.referrer || "", raw.campaign || "");
  const city = raw.city && raw.city !== "—" ? raw.city : country?.name ?? "Unknown";
  const name = city;
  const semantic = canonicalize(raw);
  return {
    ...raw,
    source,
    countryId: country?.id ?? raw.countryId ?? "",
    countryName: country?.name ?? ISO_NAME[isoGuess.toUpperCase()] ?? raw.countryName ?? isoGuess,
    city,
    name,
    initials: city.slice(0, 2).toUpperCase(),
    title: prettyTitle(raw.title || "", raw.path || "/"),
    campaign: raw.campaign || "",
    medium: raw.medium || "",
    canonicalName: semantic.canonicalName,
    intentStage: semantic.intentStage,
    destinationId: semantic.destinationId,
    contentType: semantic.contentType,
    partnerType: semantic.partnerType,
    rawEventName: semantic.rawEventName,
  };
}

export function sessionsFromEvents(events: IngestEvent[]): LivePerson[] {
  const groups = new Map<string, IngestEvent[]>();
  for (const event of [...events].sort((a, b) => a.ts - b.ts)) {
    const key = event.sessionId || event.id;
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  const now = Date.now();
  return [...groups.values()]
    .map((list) => {
      const last = list[list.length - 1]!;
      const first = list[0]!;
      const pages = list.filter((item) => item.kind === "pageview").map((item) => item.path);
      const current = list.filter((item) => item.kind !== "exit").at(-1) ?? last;
      return {
        id: first.sessionId || first.id,
        sessionId: first.sessionId || first.id,
        name: visitorName(first.sessionId || first.id),
        initials: (current.city || current.countryName || "VS").slice(0, 2).toUpperCase(),
        countryId: current.countryId,
        countryName: current.countryName,
        city: current.city,
        channelId: first.source,
        source: first.source,
        query: list.find((item) => item.query)?.query || first.source,
        pages: pages.length ? pages : [current.path],
        dwellSec: Math.max(3, Math.round((last.ts - first.ts) / 1000)),
        device: current.device,
        returning: list.length > 8,
        found: last.kind !== "exit",
        converted: list.some(isMoneyEvent),
        nextGuess: list.find((item) => item.href)?.href || "",
        path: current.path,
        title: prettyTitle(current.title, current.path),
        lang: languageOf(current.path),
        browser: current.browser,
        os: current.os,
        lastTs: last.ts,
        events: list,
        persona: personaOf(first.sessionId || first.id),
        intentScore: intentScore(list),
        qualified: false,
      } satisfies LivePerson;
    })
    .sort((a, b) => b.lastTs - a.lastTs)
    .map((person) => ({
      ...person,
      dwellSec: Math.max(person.dwellSec, Math.round((now - (person.events[0]?.ts ?? now)) / 1000)),
      qualified: isQualified(person.intentScore),
    }));
}

export function livePeople(people: LivePerson[], withinMs = 90_000) {
  const cutoff = Date.now() - withinMs;
  return people.filter((person) => person.lastTs >= cutoff && person.events.at(-1)?.kind !== "exit");
}

export function liveByCountry(people: LivePerson[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const person of livePeople(people)) {
    if (!person.countryId) continue;
    map[person.countryId] = (map[person.countryId] ?? 0) + 1;
  }
  return map;
}

export function colorForLive(count: number) {
  if (!count) return "var(--color-map-empty)";
  if (count === 1) return "var(--color-map-4)";
  if (count < 4) return "var(--color-map-5)";
  if (count < 8) return "var(--color-map-6)";
  return "var(--color-map-7)";
}

export function pulseLine(people: LivePerson[]) {
  const live = livePeople(people);
  if (!live.length) return "Waiting for the next visitor on discovercyclades.gr";
  const latest = live[0]!;
  const others = live.length - 1;
  const here = `${latest.city} · ${latest.title}`;
  if (!others) return `Live · ${here}`;
  return `${live.length} live · ${here}`;
}

export function sourceCounts(people: LivePerson[]) {
  const map = new Map<string, number>();
  for (const person of people) {
    map.set(person.source, (map.get(person.source) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function pageCounts(people: LivePerson[]) {
  const map = new Map<string, { path: string; title: string; value: number }>();
  for (const person of people) {
    const current = map.get(person.path) ?? { path: person.path, title: person.title, value: 0 };
    current.value += 1;
    map.set(person.path, current);
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
}
