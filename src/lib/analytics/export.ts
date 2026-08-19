import type { IngestEvent } from "./ingest";

const HEADERS = [
  "id",
  "ts",
  "kind",
  "sessionId",
  "source",
  "path",
  "title",
  "query",
  "country",
  "city",
  "device",
  "os",
  "browser",
  "referrer",
  "href",
] as const;

export function eventsToCsv(events: IngestEvent[]) {
  const lines = [
    HEADERS.join(","),
    ...events.map((event) =>
      [
        event.id,
        new Date(event.ts).toISOString(),
        event.kind,
        event.sessionId,
        event.source,
        event.path,
        event.title,
        event.query,
        event.countryName,
        event.city,
        event.device,
        event.os,
        event.browser,
        event.referrer,
        event.href,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
