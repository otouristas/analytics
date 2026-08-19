import type { CanonicalName } from "./canonicalize";
import type { IngestEvent } from "./ingest";

const WEIGHT: Record<CanonicalName, number> = {
  session_start: 0,
  page_view: 2,
  internal_click: 2,
  destination_select: 10,
  partner_outbound_click: 25,
  phone_click: 20,
  whatsapp_click: 20,
  email_click: 15,
  lead_submit: 40,
  form_submit: 15,
  scroll_depth: 0,
  heartbeat: 0,
  session_end: 0,
  unknown: 0,
};

const CONTENT_BONUS: Record<string, number> = {
  hotel: 15,
  ferry: 12,
  car_rental: 12,
  activity: 12,
  guide: 8,
  destination: 10,
};

export const QUALIFIED_THRESHOLD = 20;
export const MODEL_KIND = "HEURISTIC" as const;

export function intentScore(events: IngestEvent[]) {
  const seen = new Set<string>();
  let score = 0;
  for (const event of events) {
    const name = event.canonicalName ?? "unknown";
    const key = `${name}:${event.destinationId || event.path}`;
    if (name === "heartbeat" || name === "scroll_depth") continue;
    if (seen.has(key) && name !== "partner_outbound_click") continue;
    seen.add(key);
    score += WEIGHT[name] ?? 0;
    if (event.contentType) score += CONTENT_BONUS[event.contentType] ?? 0;
  }
  return Math.min(100, score);
}

export function isQualified(score: number) {
  return score >= QUALIFIED_THRESHOLD;
}
