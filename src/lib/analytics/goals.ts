import type { IngestEvent } from "./ingest";

export type Goal = {
  id: string;
  name: string;
  hint: string;
  match: (event: IngestEvent) => boolean;
};

export const GOALS: Goal[] = [
  {
    id: "ferry",
    name: "Ferry intent",
    hint: "Opened ferry tickets or ferry guide",
    match: (event) => /ferry/.test(`${event.path} ${event.title}`),
  },
  {
    id: "hotel",
    name: "Stay intent",
    hint: "Hotels page or outbound to a booking partner",
    match: (event) =>
      /hotel|stay/.test(`${event.path} ${event.title}`) ||
      (event.kind === "outbound" && /hotel|booking\.com|expedia|airbnb/i.test(event.href)),
  },
  {
    id: "villa",
    name: "Villa intent",
    hint: "Opened villas",
    match: (event) => /villa/.test(event.path),
  },
  {
    id: "partner",
    name: "Partner",
    hint: "/partner",
    match: (event) => /partner/.test(event.path),
  },
  {
    id: "ai",
    name: "Touristas AI",
    hint: "Quiz or chat",
    match: (event) => /touristas|island-quiz|budget-calculator/.test(event.path),
  },
  {
    id: "lead",
    name: "Lead",
    hint: "Form or WhatsApp",
    match: (event) => event.kind === "form" || /whatsapp|contact|phone/i.test(`${event.path} ${event.label}`),
  },
  {
    id: "leave",
    name: "Left the site",
    hint: "Outbound click",
    match: (event) => event.kind === "outbound",
  },
];

export const MONEY_GOALS = new Set(["ferry", "hotel", "villa", "partner", "lead"]);

export function goalHits(event: IngestEvent) {
  return GOALS.filter((goal) => goal.match(event));
}

export function isMoneyEvent(event: IngestEvent) {
  return GOALS.some((goal) => MONEY_GOALS.has(goal.id) && goal.match(event));
}

export function conversionLikelihood(events: IngestEvent[], dwellSec: number) {
  if (events.some(isMoneyEvent)) return 0.64;
  if (events.some((event) => goalHits(event).length > 0)) return 0.31;
  if (dwellSec > 180) return 0.18;
  if (dwellSec > 45) return 0.11;
  return 0.04;
}

export function goalStats(people: { events: IngestEvent[] }[]) {
  const rows = GOALS.map((goal) => {
    const sessions = people.filter((person) => person.events.some(goal.match)).length;
    return { ...goal, sessions, rate: people.length ? sessions / people.length : 0 };
  });
  const converted = people.filter((person) => person.events.some(isMoneyEvent)).length;
  return {
    rows,
    converted,
    perVisitor: people.length ? converted / people.length : 0,
  };
}
