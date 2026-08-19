import { CHANNELS, type Channel } from "./channels";
import { COUNTRIES } from "./countries";
import type { Country } from "./model";

export type ProductPage = {
  path: string;
  title: string;
  kind: "home" | "docs" | "commerce" | "compare" | "help" | "app";
};

export const PAGES: ProductPage[] = [
  { path: "/", title: "Home", kind: "home" },
  { path: "/pricing", title: "Pricing", kind: "commerce" },
  { path: "/atlas", title: "Atlas", kind: "app" },
  { path: "/docs/webhooks", title: "Docs · Webhooks", kind: "docs" },
  { path: "/docs/sources", title: "Docs · Sources", kind: "docs" },
  { path: "/compare/amplitude", title: "Compare · Amplitude", kind: "compare" },
  { path: "/compare/ga4", title: "Compare · GA4", kind: "compare" },
  { path: "/checkout", title: "Checkout", kind: "commerce" },
  { path: "/help/sso", title: "Help · SSO", kind: "help" },
  { path: "/search", title: "Site search", kind: "help" },
  { path: "/blog/ai-attribution", title: "AI attribution", kind: "docs" },
  { path: "/integrations/stripe", title: "Stripe", kind: "docs" },
];

export type LiveSession = {
  id: string;
  name: string;
  initials: string;
  countryId: string;
  countryName: string;
  city: string;
  channelId: string;
  query: string;
  pages: string[];
  dwellSec: number;
  device: "desktop" | "mobile";
  returning: boolean;
  found: boolean;
  converted: boolean;
  nextGuess: string;
};

const NAMES = [
  ["Amelia", "K"],
  ["Noah", "R"],
  ["Sofia", "M"],
  ["Kai", "T"],
  ["Elena", "V"],
  ["Mateo", "L"],
  ["Priya", "S"],
  ["Jonah", "H"],
  ["Aiko", "N"],
  ["Luca", "B"],
  ["Yara", "D"],
  ["Owen", "C"],
  ["Mina", "P"],
  ["Theo", "W"],
  ["Leila", "A"],
  ["Hugo", "F"],
  ["Ines", "G"],
  ["Arjun", "K"],
  ["Freya", "J"],
  ["Nico", "E"],
  ["Sable", "Q"],
  ["Ibrahim", "Z"],
  ["Clara", "O"],
  ["Ravi", "M"],
  ["June", "L"],
  ["Soren", "B"],
  ["Hana", "Y"],
  ["Idris", "T"],
  ["Noor", "S"],
  ["Pavel", "K"],
  ["Esme", "R"],
  ["Diego", "V"],
];

const CITIES: Record<string, string[]> = {
  "840": ["Austin", "Brooklyn", "Seattle"],
  "826": ["Shoreditch", "Manchester"],
  "276": ["Berlin", "Hamburg"],
  "250": ["Lyon", "Paris"],
  "124": ["Toronto", "Vancouver"],
  "392": ["Shibuya", "Osaka"],
  "410": ["Seoul"],
  "356": ["Bengaluru", "Mumbai"],
  "036": ["Melbourne"],
  "528": ["Amsterdam"],
  "752": ["Stockholm"],
  "156": ["Shanghai", "Shenzhen"],
  "076": ["São Paulo"],
  "484": ["CDMX"],
  "376": ["Tel Aviv"],
  "784": ["Dubai"],
  "702": ["Singapore"],
  "616": ["Warsaw"],
  "724": ["Barcelona"],
  "380": ["Milan"],
};

const QUERIES = [
  "meridian analytics vs mixpanel revenue map",
  "how to track chatgpt referrals in analytics",
  "best ga4 alternative for ai traffic",
  "choropleth dashboard for saas revenue",
  "perplexity cited meridian pricing",
  "stripe atlas style country analytics",
  "where did this session come from serp",
  "lost intent radar product analytics",
  "compare amplitude path exploration",
  "sso setup meridian workspace",
  "webhook events for source quality",
  "is meridian better than google analytics",
];

const NEXT = [
  "docs.stripe.com/webhooks",
  "chat.openai.com — refine the prompt",
  "perplexity.ai — competitor roundup",
  "mixpanel.com/pricing",
  "support.google.com/analytics",
  "linkedin.com — ask a peer",
  "github.com — search meridian issues",
  "site search: “SSO SAML”",
];

const TOP_IDS = ["840", "826", "276", "250", "124", "392", "410", "356", "036", "528", "752", "156", "076", "484", "376", "784", "616", "724", "380"];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)] as T;
}

function buildSessions(): LiveSession[] {
  return NAMES.map(([first, last], index) => {
    const rng = mulberry32(1103 + index * 97);
    const countryId = pick(rng, TOP_IDS);
    const country: Country | undefined = COUNTRIES.find((item) => item.id === countryId);
    const channel = CHANNELS[Math.floor(rng() * CHANNELS.length)] as Channel;
    const pageCount = 1 + Math.floor(rng() * 4);
    const pages: string[] = [];
    for (let i = 0; i < pageCount; i += 1) {
      pages.push(pick(rng, PAGES).path);
    }
    if (rng() > 0.55 && !pages.includes("/search") && !pages.includes("/help/sso")) {
      pages.push(rng() > 0.5 ? "/search" : "/compare/ga4");
    }
    const found = rng() > 0.38 && !pages.includes("/search");
    const converted = found && rng() > 0.72;
    return {
      id: `s${index + 1}`,
      name: `${first} ${last}.`,
      initials: `${first[0]}${last}`,
      countryId,
      countryName: country?.name ?? "Unknown",
      city: pick(rng, CITIES[countryId] ?? ["—"]),
      channelId: channel.id,
      query: pick(rng, QUERIES),
      pages,
      dwellSec: 18 + Math.floor(rng() * 280),
      device: rng() > 0.34 ? "desktop" : "mobile",
      returning: rng() > 0.62,
      found,
      converted,
      nextGuess: pick(rng, NEXT),
    };
  });
}

export const SESSIONS: LiveSession[] = buildSessions();

export function pageByPath(path: string): ProductPage {
  return PAGES.find((page) => page.path === path) ?? PAGES[0]!;
}

export function currentPage(session: LiveSession, tick: number): ProductPage {
  const index = (tick + session.id.charCodeAt(1)) % session.pages.length;
  return pageByPath(session.pages[index] ?? "/");
}

export function lostSessions(): LiveSession[] {
  return SESSIONS.filter((session) => !session.found);
}

export function liveNow(tick: number): number {
  return 1180 + ((tick * 17) % 86);
}

export function sessionsForCountry(countryId: string): LiveSession[] {
  return SESSIONS.filter((session) => session.countryId === countryId);
}

export function sourceMixForCountry(countryId: string): { channel: Channel; count: number }[] {
  const local = sessionsForCountry(countryId);
  const pool = local.length > 0 ? local : SESSIONS;
  const counts = new Map<string, number>();
  for (const session of pool) {
    counts.set(session.channelId, (counts.get(session.channelId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ channel: CHANNELS.find((c) => c.id === id)!, count }))
    .filter((row) => row.channel)
    .sort((a, b) => b.count - a.count);
}

export const LANDINGS = [
  { path: "/", title: "Home", share: 0.31, bounce: 0.22 },
  { path: "/pricing", title: "Pricing", share: 0.18, bounce: 0.19 },
  { path: "/blog/ai-attribution", title: "AI attribution", share: 0.14, bounce: 0.27 },
  { path: "/docs/sources", title: "Docs · Sources", share: 0.12, bounce: 0.16 },
  { path: "/compare/ga4", title: "Compare · GA4", share: 0.09, bounce: 0.34 },
  { path: "/atlas", title: "Atlas", share: 0.08, bounce: 0.11 },
  { path: "/help/sso", title: "Help · SSO", share: 0.08, bounce: 0.41 },
];

export const EXITS = [
  { path: "/pricing", title: "Pricing", share: 0.24 },
  { path: "/compare/amplitude", title: "Compare · Amplitude", share: 0.17 },
  { path: "/search", title: "Site search", share: 0.16 },
  { path: "/checkout", title: "Checkout", share: 0.14 },
  { path: "/help/sso", title: "Help · SSO", share: 0.13 },
  { path: "/", title: "Home", share: 0.16 },
];

export const FUNNEL = [
  { id: "visit", label: "Visit", value: 1 },
  { id: "engaged", label: "Engaged", value: 0.64 },
  { id: "activated", label: "Activated", value: 0.31 },
  { id: "paid", label: "Paid", value: 0.084 },
];

export const RETENTION = [1, 0.42, 0.31, 0.26, 0.22, 0.19, 0.17, 0.16];
