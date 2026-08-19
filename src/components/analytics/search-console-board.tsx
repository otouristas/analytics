import { useMemo, useState } from "react";
import {
  Check,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { PillarHeader } from "@/components/ui/pillar-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useDefaultProject,
  useGoogleSites,
  useGscProperties,
  useImportProperties,
  useLatestSyncRun,
  useLinkProperty,
  useProjects,
  useTopDimension,
  useTrackedKeywords,
  useTrackKeywords,
} from "@/lib/supabase/hooks";
import { canReadData, hostOf, matchProperties, propertyKind } from "@/lib/supabase/gsc";
import { signInWithGoogle, useSupabaseAuth } from "@/lib/supabase/auth";
import { supabaseEnabled } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Tab = "properties" | "match" | "queries" | "pages";

const TABS: { id: Tab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "match", label: "Matching" },
  { id: "queries", label: "Queries" },
  { id: "pages", label: "Pages" },
];

/**
 * Search Console: connect Google, import properties, match them to Meridian
 * properties, and pick the queries and pages worth tracking.
 *
 * The four tabs are the four steps of that job in order, and each one shows
 * real state rather than a wizard that forgets what happened. A user who has
 * already imported lands on a filled Properties tab, not step one again.
 */
export function SearchConsoleBoard() {
  const [tab, setTab] = useState<Tab>("properties");
  const { user } = useSupabaseAuth();
  const { data: imported } = useGscProperties();
  const project = useDefaultProject();
  const { data: syncRun } = useLatestSyncRun(project?.id);

  const connected = Boolean(user);
  const importedCount = imported?.length ?? 0;

  return (
    <div className="flex-1 overflow-y-auto dock-safe">
      <PillarHeader
        eyebrow="Google Search Console"
        title="Search Console"
        ident={project?.gsc_property_url ?? project?.domain}
        dek="Import your verified properties, match them to Meridian, and choose which queries and pages to track."
        crumbs={[{ label: project?.name ?? "Workspace" }, { label: "Search Console" }]}
        badges={
          <>
            <StatusBadge
              status={connected ? "connected" : "disconnected"}
              size="sm"
              label={connected ? "Google connected" : "Google not connected"}
            />
            {importedCount > 0 && (
              <StatusBadge status="healthy" size="sm" label={`${importedCount} imported`} />
            )}
            {syncRun && (
              <StatusBadge
                status={syncRun.error ? "critical" : "syncing"}
                size="sm"
                label={
                  syncRun.error
                    ? "Last sync failed"
                    : `${(syncRun.rows_written ?? 0).toLocaleString()} rows synced`
                }
              />
            )}
          </>
        }
        kpis={[]}
      />

      <div className="border-b border-hairline px-4 sm:px-6">
        <div className="scrollbar-none -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-accent text-fg"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {!supabaseEnabled ? (
          <EmptyState
            title="Supabase is not configured"
            description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild, to enable Search Console import."
          />
        ) : !connected ? (
          <ConnectGoogle />
        ) : tab === "properties" ? (
          <PropertiesTab />
        ) : tab === "match" ? (
          <MatchTab />
        ) : tab === "queries" ? (
          <QueriesTab />
        ) : (
          <PagesTab />
        )}
      </div>
    </div>
  );
}

// ── Connect ──────────────────────────────────────────────────────────────────

function ConnectGoogle() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setBusy(true);
    setError(null);
    const res = await signInWithGoogle("/app");
    if (res.error) {
      setError(res.error);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-hairline bg-surface p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Search className="size-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-fg">Connect Google Search Console</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Import your verified properties and match search performance with the rest of your
        Meridian data.
      </p>

      <div className="mt-5 rounded-xl border border-hairline bg-surface-raised p-4 text-left">
        <p className="flex items-center gap-2 text-sm font-medium text-fg">
          <ShieldCheck className="size-4 text-brand" />
          Read-only access
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Meridian requests the <code className="font-mono">webmasters.readonly</code> scope. It
          can never modify or delete anything in your Search Console.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void connect()}
        disabled={busy}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        <span>Connect Google Search Console</span>
      </button>
    </div>
  );
}

// ── Properties ───────────────────────────────────────────────────────────────

function PropertiesTab() {
  const [load, setLoad] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const { data: sites, isLoading, error } = useGoogleSites(load);
  const { data: imported } = useGscProperties();
  const importMutation = useImportProperties();

  const importedUrls = useMemo(
    () => new Set((imported ?? []).map((p) => p.site_url)),
    [imported],
  );

  const visible = useMemo(
    () =>
      (sites ?? []).filter((s) =>
        hostOf(s.siteUrl).toLowerCase().includes(filter.trim().toLowerCase()),
      ),
    [sites, filter],
  );

  const toggle = (url: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });

  const chosen = (sites ?? []).filter((s) => selected.has(s.siteUrl));

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-md">Your Search Console properties</h2>
          <p className="mt-1 text-sm text-muted">
            {sites
              ? `${sites.length} found on your Google account.`
              : "Load the properties Google has verified for your account."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLoad(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-sm font-medium text-fg transition-colors hover:border-brand/40 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          <span>{sites ? "Refresh from Google" : "Load properties"}</span>
        </button>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {(error as Error).message}
        </p>
      )}

      {isLoading && (
        <div className="mt-5 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      )}

      {!!sites?.length && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search properties…"
                className="w-full rounded-lg border border-hairline bg-surface-raised py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Set(visible.map((s) => s.siteUrl)))}
              className="rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              Clear
            </button>
          </div>

          <ul className="mesh-grid mt-4">
            {visible.map((site) => {
              const isImported = importedUrls.has(site.siteUrl);
              const isChecked = selected.has(site.siteUrl);
              const readable = canReadData(site.permissionLevel);
              return (
                <li key={site.siteUrl} className="bg-surface">
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 p-4",
                      !readable && "opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!readable}
                      onChange={() => toggle(site.siteUrl)}
                      className="size-4 shrink-0 accent-[var(--color-accent)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm text-fg">{site.siteUrl}</p>
                      <p className="caption mt-0.5">
                        {propertyKind(site.siteUrl) === "domain" ? "Domain property" : "URL prefix"}
                        {" · "}
                        {site.permissionLevel}
                      </p>
                    </div>
                    {isImported ? (
                      <StatusBadge status="connected" size="sm" label="Imported" />
                    ) : !readable ? (
                      <StatusBadge status="watch" size="sm" label="No data access" />
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={chosen.length === 0 || importMutation.isPending}
              onClick={() => importMutation.mutate(chosen)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {importMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span>
                Import {chosen.length || ""} {chosen.length === 1 ? "property" : "properties"}
              </span>
            </button>

            {importMutation.isSuccess && (
              <span className="inline-flex items-center gap-1.5 text-sm text-brand">
                <Check className="size-4" />
                Imported. Match them next.
              </span>
            )}
            {importMutation.isError && (
              <span className="text-sm text-danger">
                {(importMutation.error as Error).message}
              </span>
            )}
          </div>
        </>
      )}

      {!sites && !isLoading && !error && (
        <EmptyState
          className="mt-6"
          title="No properties loaded yet"
          description="Load your Search Console properties to choose which ones Meridian should import."
        />
      )}
    </section>
  );
}

// ── Matching ─────────────────────────────────────────────────────────────────

function MatchTab() {
  const { data: imported } = useGscProperties();
  const { data: projects } = useProjects();
  const link = useLinkProperty();

  const matches = useMemo(
    () => matchProperties(imported ?? [], projects ?? []),
    [imported, projects],
  );

  if (!imported?.length) {
    return (
      <EmptyState
        title="Nothing to match yet"
        description="Import at least one Search Console property first."
      />
    );
  }

  return (
    <section>
      <h2 className="heading-md">Match your properties</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Meridian pairs each Search Console property with the workspace property that describes
        the same site. Only an exact host match is treated as certain — a subdomain is suggested
        but still asks, because <code className="font-mono text-xs">blog.x.com</code> and{" "}
        <code className="font-mono text-xs">shop.x.com</code> are different sites.
      </p>

      <ul className="mesh-grid mt-6">
        {matches.map((m) => (
          <li key={m.property.id} className="bg-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-fg">{m.property.site_url}</p>
                <p className="caption mt-0.5">
                  {propertyKind(m.property.site_url) === "domain" ? "Domain" : "URL prefix"}
                </p>
              </div>

              <Link2 className="hidden size-4 shrink-0 text-subtle sm:block" aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <select
                  value={m.project?.id ?? ""}
                  onChange={(e) =>
                    link.mutate({
                      gscPropertyId: m.property.id,
                      seoProjectId: e.target.value || null,
                    })
                  }
                  className="w-full rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                >
                  <option value="">— Not matched —</option>
                  {(projects ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="shrink-0">
                {m.status === "linked" ? (
                  <StatusBadge status="connected" size="sm" label="Linked" />
                ) : m.status === "matched" ? (
                  <StatusBadge status="healthy" size="sm" label={`${m.confidence}% match`} />
                ) : (
                  <StatusBadge status="watch" size="sm" label="Needs review" />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {link.isError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {(link.error as Error).message}
        </p>
      )}
    </section>
  );
}

// ── Queries ──────────────────────────────────────────────────────────────────

function QueriesTab() {
  const project = useDefaultProject();
  const { data: rows, isLoading } = useTopDimension(project?.id, "query", 28, 100);
  const propertyUrl = project?.gsc_property_url ?? project?.domain ?? "";
  const { data: tracked } = useTrackedKeywords(propertyUrl || undefined);
  const trackMutation = useTrackKeywords();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const visible = useMemo(
    () =>
      (rows ?? []).filter((r) => r.key.toLowerCase().includes(filter.trim().toLowerCase())),
    [rows, filter],
  );

  const toggle = (k: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  if (!project) {
    return (
      <EmptyState
        title="No property selected"
        description="Import and match a Search Console property to browse its queries."
      />
    );
  }

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading-md">Queries</h2>
          <p className="mt-1 text-sm text-muted">
            Last 28 days from Search Console. Pick the ones worth a ranking history.
          </p>
        </div>
        <button
          type="button"
          disabled={picked.size === 0 || trackMutation.isPending}
          onClick={() =>
            trackMutation.mutate({
              property: propertyUrl,
              keywords: [...picked],
              projectId: project.id,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {trackMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          <span>Track {picked.size || ""} selected</span>
        </button>
      </header>

      <div className="relative mt-4 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter queries…"
          className="w-full rounded-lg border border-hairline bg-surface-raised py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
        />
      </div>

      {isLoading && (
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-11 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !visible.length && (
        <EmptyState
          className="mt-6"
          title="No query data"
          description="Once a Search Console sync completes, your queries appear here."
        />
      )}

      {!!visible.length && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-hairline">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10" />
                <th>Query</th>
                <th className="text-right">Clicks</th>
                <th className="text-right">Impr.</th>
                <th className="text-right">CTR</th>
                <th className="text-right">Position</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const already = tracked?.has(r.key);
                return (
                  <tr key={r.key}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Track ${r.key}`}
                        checked={picked.has(r.key)}
                        disabled={already}
                        onChange={() => toggle(r.key)}
                        className="size-4 accent-[var(--color-accent)]"
                      />
                    </td>
                    <td className="max-w-[22rem] truncate whitespace-normal text-fg">{r.key}</td>
                    <td className="text-right font-medium">{r.clicks.toLocaleString()}</td>
                    <td className="text-right text-muted">{r.impressions.toLocaleString()}</td>
                    <td className="text-right text-muted">{(r.ctr * 100).toFixed(1)}%</td>
                    <td className="text-right text-muted">{r.position.toFixed(1)}</td>
                    <td className="text-right">
                      {already && <StatusBadge status="connected" size="sm" label="Tracked" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {trackMutation.isSuccess && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand">
          <Check className="size-4" /> Tracking started.
        </p>
      )}
      {trackMutation.isError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {(trackMutation.error as Error).message}
        </p>
      )}
    </section>
  );
}

// ── Pages ────────────────────────────────────────────────────────────────────

function PagesTab() {
  const project = useDefaultProject();
  const { data: rows, isLoading } = useTopDimension(project?.id, "page", 28, 100);

  if (!project) {
    return (
      <EmptyState
        title="No property selected"
        description="Import and match a Search Console property to browse its pages."
      />
    );
  }

  return (
    <section>
      <h2 className="heading-md">Pages</h2>
      <p className="mt-1 text-sm text-muted">
        Landing pages receiving search traffic over the last 28 days.
      </p>

      {isLoading && (
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-11 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !rows?.length && (
        <EmptyState
          className="mt-6"
          title="No page data"
          description="Once a Search Console sync completes, your pages appear here."
        />
      )}

      {!!rows?.length && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-hairline">
          <table className="data-table">
            <thead>
              <tr>
                <th>Page</th>
                <th className="text-right">Clicks</th>
                <th className="text-right">Impr.</th>
                <th className="text-right">CTR</th>
                <th className="text-right">Position</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="max-w-[26rem] truncate font-mono text-xs text-fg">
                    {pathOf(r.key)}
                  </td>
                  <td className="text-right font-medium">{r.clicks.toLocaleString()}</td>
                  <td className="text-right text-muted">{r.impressions.toLocaleString()}</td>
                  <td className="text-right text-muted">{(r.ctr * 100).toFixed(1)}%</td>
                  <td className="text-right text-muted">{r.position.toFixed(1)}</td>
                  <td className="text-right">
                    <a
                      href={r.key}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Open <ExternalLink className="size-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}
