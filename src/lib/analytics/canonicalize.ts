import { contentTypeFromPath, destinationFromPath, partnerTypeFromHref } from "./destinations";
import type { EventKind, IngestEvent } from "./ingest";

export const SCHEMA_VERSION = 1;

export type CanonicalName =
  | "session_start"
  | "page_view"
  | "internal_click"
  | "destination_select"
  | "partner_outbound_click"
  | "phone_click"
  | "whatsapp_click"
  | "email_click"
  | "lead_submit"
  | "form_submit"
  | "scroll_depth"
  | "heartbeat"
  | "session_end"
  | "unknown";

export type IntentStage = "exposure" | "exploration" | "destination_interest" | "commercial_intent" | "confirmed";

type Nested = {
  event_name?: string;
  event_type?: string;
  event_data?: { event_type?: string; island?: string; destination?: string };
  payload?: Nested;
};

function nested(raw: IngestEvent): Nested {
  const extra = raw as IngestEvent & { properties?: Nested; payload?: Nested };
  return extra.payload ?? extra.properties?.payload ?? extra.properties ?? {};
}

function pickName(raw: IngestEvent): { canonical: CanonicalName; rawName: string } {
  const nest = nested(raw);
  const innerName = (nest.event_name || nest.payload?.event_name || "").toLowerCase();
  const innerType = (
    nest.event_type ||
    nest.event_data?.event_type ||
    nest.payload?.event_data?.event_type ||
    ""
  ).toLowerCase();
  const kind = (raw.kind || innerName || "unknown").toLowerCase();
  const blob = `${kind} ${innerName} ${innerType} ${raw.label} ${raw.path} ${raw.href}`.toLowerCase();

  if (kind === "heartbeat" || innerName === "heartbeat") return { canonical: "heartbeat", rawName: kind };
  if (kind === "exit" || innerName === "session_end" || innerName === "page_exit") {
    return { canonical: "session_end", rawName: kind };
  }
  if (innerName === "session_start") return { canonical: "session_start", rawName: innerName };
  if (innerType === "area_badge_click" || /area_badge|island.?badge|destination_select/.test(blob)) {
    return { canonical: "destination_select", rawName: innerType || kind };
  }
  if (/whatsapp|wa\.me/.test(blob)) return { canonical: "whatsapp_click", rawName: kind };
  if (/^tel:|phone_click/.test(blob)) return { canonical: "phone_click", rawName: kind };
  if (/mailto:|email_click/.test(blob)) return { canonical: "email_click", rawName: kind };
  if (/newsletter|lead_submit|partner_lead/.test(blob)) return { canonical: "lead_submit", rawName: kind };
  if (kind === "form") return { canonical: "form_submit", rawName: kind };
  if (kind === "outbound" || innerName === "click_outbound" || (innerName === "inside_click" && /http/.test(raw.href))) {
    return { canonical: "partner_outbound_click", rawName: kind };
  }
  if (kind === "click" || innerName === "inside_click" || innerName === "click") {
    return { canonical: "internal_click", rawName: kind };
  }
  if (kind === "scroll") return { canonical: "scroll_depth", rawName: kind };
  if (kind === "pageview" || innerName === "__pageview__" || innerName === "pageview" || innerName === "page_view") {
    return { canonical: "page_view", rawName: kind };
  }
  return { canonical: "unknown", rawName: kind };
}

function stageOf(name: CanonicalName, contentType: string): IntentStage {
  if (name === "lead_submit") return "confirmed";
  if (
    name === "partner_outbound_click" ||
    name === "phone_click" ||
    name === "whatsapp_click" ||
    name === "email_click" ||
    contentType === "hotel" ||
    contentType === "ferry" ||
    contentType === "car_rental" ||
    contentType === "activity"
  ) {
    return "commercial_intent";
  }
  if (name === "destination_select" || contentType === "destination" || contentType === "guide") {
    return "destination_interest";
  }
  if (name === "internal_click" || name === "form_submit") return "exploration";
  return "exposure";
}

export function canonicalize(raw: IngestEvent) {
  const nest = nested(raw);
  const { canonical, rawName } = pickName(raw);
  const destinationId =
    destinationFromPath(raw.path, raw.title) ||
    String(nest.event_data?.island || nest.event_data?.destination || "").toLowerCase();
  const contentType = contentTypeFromPath(raw.path);
  const partnerType = partnerTypeFromHref(raw.href, raw.path);
  return {
    schemaVersion: SCHEMA_VERSION,
    rawEventName: rawName,
    canonicalName: canonical,
    eventCategory: canonical,
    intentStage: stageOf(canonical, contentType),
    destinationId,
    contentType,
    partnerType,
  };
}

export function asKind(name: CanonicalName): EventKind {
  if (name === "page_view" || name === "session_start") return "pageview";
  if (name === "session_end") return "exit";
  if (name === "heartbeat") return "heartbeat";
  if (name === "partner_outbound_click") return "outbound";
  if (name === "form_submit" || name === "lead_submit") return "form";
  if (name === "scroll_depth") return "scroll";
  return "click";
}
