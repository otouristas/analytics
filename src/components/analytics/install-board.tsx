import { Button } from "@/components/ui/button";
import { type IngestEvent } from "@/lib/analytics/ingest";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

type Stack = "next" | "script" | "react" | "gtm";

const PINGS = [
  { source: "google", path: "/en/guides/santorini", title: "Santorini guide", query: "santorini ferry from athens" },
  { source: "grok", path: "/en/guides/milos", title: "Milos guide", query: "best cyclades island 2026" },
  { source: "x", path: "/en", title: "Discover Cyclades", query: "" },
  { source: "chatgpt", path: "/en/guides/paros", title: "Paros guide", query: "paros vs naxos" },
];

export function InstallBoard() {
  const setView = useAnalytics((s) => s.setView);
  const projectId = useAnalytics((s) => s.projectId);
  const project = PROJECT_BY_ID[projectId];
  const [stack, setStack] = useState<Stack>("next");
  const [origin, setOrigin] = useState("");
  const [log, setLog] = useState<IngestEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [stored, setStored] = useState(0);
  const [cookieless, setCookieless] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    void fetch(`/api/stats?key=${encodeURIComponent(project.writeKey)}`)
      .then((res) => res.json())
      .then((body: { stored?: number }) => setStored(body.stored ?? 0))
      .catch(() => undefined);
  }, [project.writeKey]);

  useEffect(() => {
    let after = 0;
    const pull = async () => {
      const res = await fetch(`/api/live?after=${after}`);
      const body = (await res.json()) as { events?: IngestEvent[] };
      const events = body.events ?? [];
      if (events[0]) after = events[0].ts;
      if (events.length) {
        setLog((current) => {
          const seen = new Set(current.map((item) => item.id));
          return [...events.filter((item) => !seen.has(item.id)), ...current].slice(0, 24);
        });
      }
    };
    void pull();
    const id = window.setInterval(() => void pull(), 1600);
    return () => window.clearInterval(id);
  }, []);

  const snippets = useMemo(
    () => buildSnippets(origin, project.writeKey, cookieless),
    [origin, project.writeKey, cookieless],
  );

  const fire = async (item: (typeof PINGS)[number]) => {
    setBusy(true);
    try {
      await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writeKey: project.writeKey,
          host: project.host,
          kind: "pageview",
          ...item,
          name: "Test visitor",
          countryId: item.source === "google" ? "276" : "300",
          city: item.source === "google" ? "Berlin" : "Athens",
        }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-6">
        <p className="text-xs tracking-wide text-muted uppercase">{project.host}</p>
        <h2 className="font-display text-3xl text-fg">One snippet. Live users, paths, clicks, exits.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Discover Cyclades now posts to same-origin /api/meridian. Run the
          meridian_events SQL in Supabase once, then Live and Flow show real
          visitors — not sample data.
        </p>
        <p className="mt-4 font-mono text-xs text-subtle">
          Write key · {project.writeKey} · warehouse {stored} events
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          Agent: GET {typeof window !== "undefined" ? window.location.origin : ""}/api/agent?key={project.writeKey}
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={cookieless}
            onChange={(event) => setCookieless(event.target.checked)}
          />
          Cookieless (session lives in this tab only — no banner needed)
        </label>
      </section>

      <section className="grid gap-px bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["next", "Next.js layout"],
                ["script", "Script tag"],
                ["react", "useEffect"],
                ["gtm", "Tag Manager"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStack(id)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs",
                  stack === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-elevated p-4 font-mono text-xs leading-relaxed text-fg">
            {snippets[stack]}
          </pre>
        </article>

        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Test the pipeline</h3>
          <p className="mt-1 font-display text-lg text-fg">Pretend a visitor hit Santorini</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PINGS.map((item) => (
              <Button key={item.path + item.source} variant="outline" size="sm" disabled={busy} onClick={() => void fire(item)}>
                {item.source} · {item.title}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/sandbox">Open Cyclades test site</Link>
            </Button>
            <Button variant="outline" onClick={() => setView("flow")}>
              Open Flow
            </Button>
            <Button variant="outline" onClick={() => setView("live")}>
              Open Live
            </Button>
          </div>
          <ul className="mt-5 space-y-2">
            {log.length === 0 && <li className="text-sm text-subtle">No hits yet. Send a Santorini ping.</li>}
            {log.map((event) => (
              <li key={event.id} className="flex justify-between gap-3 text-xs">
                <span className="truncate text-fg">
                  {event.kind} · {event.source} · {event.path}
                </span>
                <span className="shrink-0 font-mono text-subtle">{event.countryName}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function buildSnippets(origin: string, writeKey: string, cookieless: boolean) {
  const host = origin || "https://your-meridian-host";
  const extra = cookieless ? `\n    s.dataset.cookieless = "1";` : "";
  const attr = cookieless ? ` data-cookieless="1"` : "";
  return {
    next: `// app/components/Meridian.tsx
"use client";
import { useEffect } from "react";

export function Meridian() {
  useEffect(() => {
    if (document.querySelector("script[data-meridian]")) return;
    const s = document.createElement("script");
    s.src = "${host}/meridian.js";
    s.async = true;
    s.dataset.meridianId = "${writeKey}";
    s.dataset.host = "${host}";
    s.dataset.meridian = "1";${extra}
    document.head.appendChild(s);
  }, []);
  return null;
}`,
    script: `<script defer data-meridian-id="${writeKey}" data-host="${host}"${attr} src="${host}/meridian.js"></script>`,
    react: `useEffect(() => {
  const s = document.createElement("script");
  s.src = "${host}/meridian.js";
  s.async = true;
  s.dataset.meridianId = "${writeKey}";
  s.dataset.host = "${host}";${cookieless ? `\n  s.dataset.cookieless = "1";` : ""}
  document.head.appendChild(s);
}, []);`,
    gtm: `<!-- Google Tag Manager Custom HTML -->
<script>
  (function(){
    var s=document.createElement("script");
    s.src="${host}/meridian.js";
    s.async=true;
    s.setAttribute("data-meridian-id","${writeKey}");
    s.setAttribute("data-host","${host}");${cookieless ? `\n    s.setAttribute("data-cookieless","1");` : ""}
    document.head.appendChild(s);
  })();
</script>`,
  };
}
