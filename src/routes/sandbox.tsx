import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CYCLADES_WRITE_KEY } from "@/lib/analytics/ingest";

export const Route = createFileRoute("/sandbox")({ component: Sandbox });

const PAGES = [
  { path: "/en", title: "Home", body: "Guides, ferries and hotels across the Cyclades." },
  { path: "/en/guides/santorini", title: "Santorini", body: "Caldera villages, ferries from Athens, and where to stay." },
  { path: "/en/guides/paros", title: "Paros", body: "The hub island — beaches, Naoussa, and onward boats." },
  { path: "/en/guides/milos", title: "Milos", body: "Sarakiniko, Kleftiko, and the quieter 2026 pick." },
];

function Sandbox() {
  const [page, setPage] = useState(PAGES[0]!);
  const [source, setSource] = useState("google");
  const [sent, setSent] = useState(0);

  useEffect(() => {
    void ping({
      kind: "pageview",
      path: page.path,
      title: page.title,
      source,
      query: source === "direct" ? "" : `${page.title.toLowerCase()} cyclades`,
    }).then(() => setSent((n) => n + 1));
  }, [page, source]);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-xs text-muted">discovercyclades.gr test · {sent} hits</p>
        <Link to="/" className="text-xs text-fg underline-offset-2 hover:underline">
          Back to Flow
        </Link>
      </div>
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-6">
        <p className="font-display text-2xl italic">Discover Cyclades</p>
        <nav className="flex flex-wrap gap-2">
          {PAGES.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => setPage(item)}
              className={
                page.path === item.path
                  ? "h-8 rounded-md bg-primary px-3 text-xs text-primary-fg"
                  : "h-8 rounded-md px-3 text-xs text-muted hover:text-fg"
              }
            >
              {item.title}
            </button>
          ))}
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs tracking-wide text-muted uppercase">Traffic source</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["google", "grok", "chatgpt", "x", "direct"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSource(item)}
              className={
                source === item
                  ? "h-8 rounded-md bg-elevated px-3 text-xs text-fg"
                  : "h-8 rounded-md px-3 text-xs text-muted hover:text-fg"
              }
            >
              {item}
            </button>
          ))}
        </div>
        <h1 className="mt-10 font-display text-4xl text-fg">{page.title}</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{page.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={page.path === "/en" ? "/en/guides/santorini" : "/en"}
            onClick={(event) => {
              event.preventDefault();
              void ping({
                kind: "click",
                path: page.path,
                title: page.title,
                href: "https://discovercyclades.gr/en/guides/santorini",
                label: "Santorini guide",
                source,
              });
            }}
            className="text-sm text-fg underline-offset-2 hover:underline"
          >
            Inside click · Santorini
          </a>
          <a
            href="https://ferryhopper.com"
            onClick={(event) => {
              event.preventDefault();
              void ping({
                kind: "outbound",
                path: page.path,
                title: page.title,
                href: "https://ferryhopper.com",
                label: "Ferryhopper",
                source,
              });
            }}
            className="text-sm text-fg underline-offset-2 hover:underline"
          >
            Outbound · Ferryhopper
          </a>
        </div>
      </section>
    </main>
  );
}

async function ping(payload: Record<string, string>) {
  await fetch("/api/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      writeKey: CYCLADES_WRITE_KEY,
      host: "discovercyclades.gr",
      name: "You",
      countryId: "300",
      city: "Athens",
      ...payload,
    }),
  });
}
