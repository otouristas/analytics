import { Command } from "cmdk";
import { Link } from "@tanstack/react-router";
import { Maximize2, Moon, Search, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { WorldMap } from "@/components/analytics/world-map";
import { ProjectionSwitch, WorldGlobe } from "@/components/analytics/world-globe";
import { VisitorFigure } from "@/components/analytics/visitor-marker";
import { ChannelLogo } from "@/components/analytics/channel-logo";
import { CountryPanel } from "@/components/analytics/country-panel";
import { ISO2_BY_ID } from "@/lib/analytics/ingest";
import { flagEmoji } from "@/lib/analytics/visitor-name";
import { SourceBoard } from "@/components/analytics/source-board";
import { LiveBoard } from "@/components/analytics/live-board";
import { IntentBoard } from "@/components/analytics/intent-board";
import { ReportBoard } from "@/components/analytics/report-board";
import { QueryBoard } from "@/components/analytics/query-board";
import { LabBoard } from "@/components/analytics/lab-board";
import { InstallBoard } from "@/components/analytics/install-board";
import { FlowBoard } from "@/components/analytics/flow-board";
import { OverviewBoard } from "@/components/analytics/overview-board";
import { PagesBoard } from "@/components/analytics/pages-board";
import { EventsBoard } from "@/components/analytics/events-board";
import { FunnelBoard } from "@/components/analytics/funnel-board";
import { OpportunityBoard } from "@/components/analytics/opportunity-board";
import { DeviceBoard } from "@/components/analytics/device-board";
import { CampaignBoard } from "@/components/analytics/campaign-board";
import { CommerceBoard } from "@/components/analytics/commerce-board";
import { CohortBoard } from "@/components/analytics/cohort-board";
import { AlertBoard } from "@/components/analytics/alert-board";
import { DebugBoard } from "@/components/analytics/debug-board";
import { SeoBoard } from "@/components/analytics/seo-board";
import { CauseBoard } from "@/components/analytics/cause-board";
import { SegmentBoard } from "@/components/analytics/segment-board";
import { EngagementBoard } from "@/components/analytics/engagement-board";
import { GoalsBoard } from "@/components/analytics/goals-board";
import { DemandBoard } from "@/components/analytics/demand-board";
import { FilterBar } from "@/components/analytics/filter-bar";
import { Sidebar, SidebarTrigger } from "@/components/analytics/sidebar";
import { SiteMark } from "@/components/analytics/site-mark";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { coreMetrics } from "@/lib/analytics/insights";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { COUNTRIES } from "@/lib/analytics/countries";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";
import { useLiveFeed, useRealtime } from "@/lib/analytics/use-live-feed";

export function Dashboard() {
  const selectedId = useAnalytics((s) => s.selectedId);
  const setSelectedId = useAnalytics((s) => s.setSelectedId);
  const view = useAnalytics((s) => s.view);
  const setView = useAnalytics((s) => s.setView);
  const projection = useAnalytics((s) => s.projection);
  const theme = useAnalytics((s) => s.theme);
  const toggleTheme = useAnalytics((s) => s.toggleTheme);
  const projectId = useAnalytics((s) => s.projectId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const focusRef = useRef<(id: string) => void>(() => {});
  const isDesktop = useDesktop();
  const project = PROJECT_BY_ID[projectId];
  useLiveFeed();
  const realtime = useRealtime();

  const bindFocus = useCallback((fn: (id: string) => void) => {
    focusRef.current = fn;
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        const target = event.target as HTMLElement | null;
        if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedId]);

  const selectCountry = (id: string) => {
    setSelectedId(id);
    setView("atlas");
    setSearchOpen(false);
    setQuery("");
    focusRef.current(id);
  };

  return (
    <div className="flex min-h-dvh bg-bg text-fg lg:h-dvh lg:overflow-hidden">
      <Sidebar />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <header
        className={cn(
          "z-20 flex h-14 items-center gap-3 px-3 sm:px-5",
          view === "atlas" ? "absolute inset-x-0 top-0 glass-thin" : "relative border-b border-border glass-thin",
        )}
      >
        <SidebarTrigger />
        <SiteMark id={project.id} mark={project.mark} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg italic leading-none text-fg">{project.name}</p>
          <p className="mt-1 truncate text-xs text-subtle">{project.host}</p>
        </div>
        <div className="mx-3 hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <span className="live-dot size-1.5 shrink-0 rounded-full bg-positive" />
          <span className="truncate text-xs text-muted">{realtime.pulse}</span>
          <span className="shrink-0 text-xs text-subtle">
            {realtime.events[0]
              ? Date.now() - realtime.events[0].ts < 5000
                ? "Realtime"
                : `${Math.max(1, Math.round((Date.now() - realtime.events[0].ts) / 1000))}s ago`
              : "Waiting"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
        <AuthSlot />
      </header>

      {view !== "atlas" && (
        <div className="flex h-9 items-center gap-3 border-b border-border px-3 lg:hidden">
          <span className="live-dot size-1.5 shrink-0 rounded-full bg-positive" />
          <span className="truncate text-xs text-muted">{realtime.pulse}</span>
        </div>
      )}

      {view !== "atlas" && <FilterBar />}

      {view === "atlas" ? (
        <div className="relative min-h-0 flex-1 bg-ocean" data-atlas-root>
          <div className="absolute inset-0">
            {projection === "globe" ? (
              <WorldGlobe onFocusCountry={bindFocus} />
            ) : (
              <WorldMap onFocusCountry={bindFocus} />
            )}
          </div>

          <AtlasHud />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-3 sm:p-5">
            <div className="pointer-events-auto flex items-center gap-3">
              <ProjectionSwitch />
              <button
                type="button"
                className="glass-pill px-3 py-1.5 text-xs text-muted hover:text-fg"
                onClick={() => {
                  const node = document.querySelector("[data-atlas-root]");
                  if (node instanceof HTMLElement) void node.requestFullscreen?.();
                }}
              >
                <Maximize2 className="mr-1 inline size-3.5" />
                Fullscreen
              </button>
            </div>
          </div>
        </div>
      ) : view === "overview" ? (
        <OverviewBoard />
      ) : view === "sources" ? (
        <SourceBoard />
      ) : view === "live" ? (
        <LiveBoard />
      ) : view === "pages" ? (
        <PagesBoard />
      ) : view === "events" ? (
        <EventsBoard />
      ) : view === "conversions" ? (
        <GoalsBoard />
      ) : view === "funnels" ? (
        <FunnelBoard />
      ) : view === "opportunities" ? (
        <OpportunityBoard />
      ) : view === "devices" ? (
        <DeviceBoard />
      ) : view === "campaigns" ? (
        <CampaignBoard />
      ) : view === "commerce" ? (
        <CommerceBoard />
      ) : view === "cohorts" ? (
        <CohortBoard />
      ) : view === "alerts" ? (
        <AlertBoard />
      ) : view === "debug" ? (
        <DebugBoard />
      ) : view === "seo" ? (
        <SeoBoard />
      ) : view === "cause" ? (
        <CauseBoard />
      ) : view === "segments" ? (
        <SegmentBoard />
      ) : view === "engagement" ? (
        <EngagementBoard />
      ) : view === "intent" ? (
        <IntentBoard />
      ) : view === "demand" ? (
        <DemandBoard />
      ) : view === "reports" ? (
        <ReportBoard />
      ) : view === "query" ? (
        <QueryBoard />
      ) : view === "install" ? (
        <InstallBoard />
      ) : view === "flow" ? (
        <FlowBoard />
      ) : (
        <LabBoard />
      )}

      <MobilePanel open={!isDesktop && view === "atlas" && Boolean(selectedId)} />

      {searchOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-bg/40 px-4 pt-24 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <Command
            className="glass-strong relative z-10 w-full max-w-lg overflow-hidden rounded-xl"
            label="Search countries"
          >
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Jump to a country"
              className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle"
            />
            <Command.List className="max-h-72 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
                Nothing matches
              </Command.Empty>
              {[
                ["overview", "Overview"],
                ["atlas", "Realtime globe"],
                ["live", "Live people"],
                ["sources", "Acquisition"],
                ["pages", "Pages"],
                ["funnels", "Funnels"],
                ["opportunities", "Opportunities"],
                ["seo", "SEO"],
                ["segments", "Segments"],
                ["cause", "Root cause"],
                ["query", "Ask Meridian"],
              ].map(([id, label]) => (
                <Command.Item
                  key={id}
                  value={label}
                  onSelect={() => {
                    setView(id as typeof view);
                    setSearchOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-sm data-[selected=true]:bg-elevated"
                >
                  {label}
                </Command.Item>
              ))}
              {COUNTRIES.filter((country) =>
                `${country.name} ${country.iso3}`.toLowerCase().includes(query.toLowerCase()),
              )
                .slice(0, 12)
                .map((country) => (
                  <Command.Item
                    key={country.id}
                    value={`${country.name} ${country.iso3}`}
                    onSelect={() => selectCountry(country.id)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm data-[selected=true]:bg-elevated"
                  >
                    <span>{country.name}</span>
                    <span className="font-mono text-xs text-subtle">{country.iso3}</span>
                  </Command.Item>
                ))}
            </Command.List>
          </Command>
        </div>
      )}
      </div>
    </div>
  );
}

function AtlasHud() {
  const { live, people, sources, project, events } = useRealtime();
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const core = coreMetrics(people);
  const countries = Object.entries(
    live.reduce<Record<string, number>>((map, person) => {
      map[person.countryName] = (map[person.countryName] ?? 0) + 1;
      return map;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const devices = Object.entries(
    live.reduce<Record<string, number>>((map, person) => {
      map[person.device] = (map[person.device] ?? 0) + 1;
      return map;
    }, {}),
  );
  const feed = events
    .filter((event) => event.kind !== "heartbeat")
    .slice(0, 8);

  return (
    <>
      <div className="pointer-events-auto absolute top-16 left-4 z-20 w-[min(22rem,calc(100%-2rem))]">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg italic text-fg">Meridian</span>
            <span className="flex -space-x-2">
              {live.slice(0, 4).map((person) => (
                <VisitorFigure key={person.id} personId={person.id} device={person.device} size="sm" />
              ))}
            </span>
          </div>
          <p className="mt-3 text-sm text-fg">
            <span className="live-dot mr-2 inline-block size-1.5 rounded-full bg-positive" />
            {live.length} visitors on {project.host}
          </p>
          <p className="mt-1 text-xs text-muted">
            Bounce {Math.round(core.bounce * 100)}% · avg {Math.round(core.avgDuration)}s · est. $0
          </p>
          <dl className="mt-3 space-y-2 text-xs text-muted">
            <div className="flex flex-wrap items-center gap-2">
              <dt className="w-16 shrink-0">Referrers</dt>
              {sources.slice(0, 4).map(([id, value]) => (
                <dd key={id} className="inline-flex items-center gap-1 text-fg">
                  <ChannelLogo id={id} size="sm" />
                  {CHANNEL_BY_ID[id]?.name ?? id} ({value})
                </dd>
              ))}
              {sources.length === 0 && <dd>—</dd>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="w-16 shrink-0">Countries</dt>
              {countries.slice(0, 4).map(([name, value]) => {
                const person = live.find((item) => item.countryName === name);
                const iso = person ? ISO2_BY_ID[person.countryId] ?? "" : "";
                return (
                  <dd key={name} className="text-fg">
                    {flagEmoji(iso)} {name} ({value})
                  </dd>
                );
              })}
              {countries.length === 0 && <dd>—</dd>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="w-16 shrink-0">Devices</dt>
              {devices.map(([name, value]) => (
                <dd key={name} className="capitalize text-fg">
                  {name} ({value})
                </dd>
              ))}
              {devices.length === 0 && <dd>—</dd>}
            </div>
          </dl>
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-16 left-4 z-20 hidden w-[min(24rem,calc(100%-2rem))] sm:block">
        <div className="glass-strong max-h-56 overflow-y-auto rounded-2xl p-3">
          {feed.length === 0 && <p className="text-xs text-subtle">Waiting for actions…</p>}
          {feed.map((event) => {
            const person = people.find((item) => item.sessionId === event.sessionId);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => setSessionId(event.sessionId)}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-elevated"
              >
                {person && <VisitorFigure personId={person.id} device={person.device} size="sm" />}
                <span className="min-w-0 text-xs">
                  <span className="text-fg">{person?.name ?? "visitor"}</span>
                  {event.kind === "pageview" ? (
                    <span className="text-muted"> visited {event.path}</span>
                  ) : (
                    <span className="text-muted">
                      {" "}
                      performed {event.kind}
                      {event.path ? ` ${event.path}` : ""}
                    </span>
                  )}
                  <span className="mt-0.5 block text-subtle">
                    {Math.max(1, Math.round((Date.now() - event.ts) / 60000))} min ago
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-pill stagger-in px-3 py-2">
      <p className="kicker">{label}</p>
      <p className="mt-1 font-mono text-sm tabular-nums tracking-tight text-fg">{value}</p>
    </div>
  );
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return desktop;
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-elevated" />;
  }
  if (user) {
    return (
      <SignedIn>
        <div className="[&_img]:size-8 [&_img]:rounded-full [&_button]:text-xs [&_button]:text-muted">
          <UserButton />
        </div>
      </SignedIn>
    );
  }
  return (
    <SignedOut>
      <Button asChild variant="outline" size="sm">
        <Link to="/login">Sign in</Link>
      </Button>
    </SignedOut>
  );
}

function MobilePanel({ open }: { open: boolean }) {
  const setSelectedId = useAnalytics((s) => s.setSelectedId);
  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && setSelectedId(null)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-bg/60 lg:hidden" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[72dvh] overflow-hidden rounded-t-xl bg-surface outline-none lg:hidden">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong" />
          <Drawer.Title className="sr-only">Country detail</Drawer.Title>
          <div className="max-h-[70dvh] overflow-y-auto">
            <CountryPanel />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
