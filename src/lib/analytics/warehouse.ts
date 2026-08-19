import { getSql } from "@/lib/db";
import type { EventKind, IngestEvent } from "./ingest";

export async function persistEvent(event: IngestEvent) {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into meridian_events (
        id, property_id, write_key, session_id, event_name, ts,
        host, path, title, referrer, source, query,
        country_id, country_name, city, device, os, browser, href, label, from_path
      ) values (
        $1,$2,$3,$4,$5, to_timestamp($6 / 1000.0),
        $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) on conflict (id) do nothing`,
      [
        event.id,
        event.writeKey,
        event.writeKey,
        event.sessionId,
        event.kind,
        event.ts,
        event.host,
        event.path,
        event.title,
        event.referrer,
        event.source,
        event.query,
        event.countryId,
        event.countryName,
        event.city,
        event.device,
        event.os,
        event.browser,
        event.href,
        event.label,
        event.fromPath,
      ],
    );
  } catch {
    // Realtime ring still accepted the event.
  }
}

type Row = {
  id: string;
  session_id: string;
  event_name: string;
  ts: string;
  host: string;
  path: string;
  title: string;
  referrer: string;
  source: string;
  query: string;
  country_id: string;
  country_name: string;
  city: string;
  device: string;
  os: string;
  browser: string;
  href: string;
  label: string;
  from_path: string;
  write_key: string;
};

export async function loadHistory(writeKey: string, limit = 1200): Promise<IngestEvent[]> {
  const sql = await getSql();
  const rows = await sql.query<Row>(
    `select id, session_id, event_name, ts::text as ts, host, path, title, referrer, source, query,
            country_id, country_name, city, device, os, browser, href, label, from_path, write_key
     from meridian_events
     where write_key = $1
     order by ts desc
     limit $2`,
    [writeKey, limit],
  );
  return rows.map((row) => ({
    id: row.id,
    ts: Date.parse(row.ts) || Date.now(),
    writeKey: row.write_key,
    sessionId: row.session_id,
    kind: (row.event_name as EventKind) || "pageview",
    host: row.host || "",
    path: row.path || "/",
    title: row.title || "",
    fromPath: row.from_path || "",
    href: row.href || "",
    label: row.label || "",
    source: row.source || "direct",
    referrer: row.referrer || "",
    query: row.query || "",
    countryId: row.country_id || "",
    countryName: row.country_name || "",
    city: row.city || "",
    device: row.device === "mobile" ? "mobile" : "desktop",
    os: row.os || "",
    browser: row.browser || "",
    campaign: "",
    medium: "",
    name: "",
    initials: "",
  }));
}
