import { PROJECTS, PROJECT_BY_ID, type ProjectId } from "@/lib/analytics/projects";
import { SiteMark } from "@/components/analytics/site-mark";
import { useAnalytics, type WorkspaceView } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Check,
  ChevronsLeft,
  ChevronsUpDown,
  Compass,
  FileText,
  Filter,
  FlaskConical,
  GitBranch,
  Globe2,
  LayoutDashboard,
  Megaphone,
  MousePointerClick,
  PanelLeft,
  Radio,
  Settings2,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  SquareTerminal,
  Table2,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const GROUPS: { label: string; items: { id: WorkspaceView; label: string; icon: typeof Globe2 }[] }[] = [
  {
    label: "Observe",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "atlas", label: "Realtime", icon: Globe2 },
      { id: "live", label: "Live", icon: Radio },
    ],
  },
  {
    label: "Understand",
    items: [
      { id: "sources", label: "Acquisition", icon: Share2 },
      { id: "pages", label: "Pages", icon: FileText },
      { id: "seo", label: "SEO", icon: Search },
      { id: "events", label: "Events", icon: MousePointerClick },
      { id: "conversions", label: "Goals", icon: Target },
      { id: "funnels", label: "Funnels", icon: Filter },
      { id: "flow", label: "Journeys", icon: GitBranch },
      { id: "devices", label: "Performance", icon: Activity },
      { id: "engagement", label: "Engagement", icon: MousePointerClick },
      { id: "campaigns", label: "Campaigns", icon: Megaphone },
      { id: "commerce", label: "Revenue", icon: ShoppingBag },
      { id: "cohorts", label: "Cohorts", icon: Users },
      { id: "segments", label: "Segments", icon: Filter },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "opportunities", label: "Opportunities", icon: Sparkles },
      { id: "cause", label: "Root cause", icon: Compass },
      { id: "intent", label: "Intent", icon: Compass },
      { id: "demand", label: "Destinations", icon: Compass },
      { id: "alerts", label: "Alerts", icon: Bell },
      { id: "reports", label: "Reports", icon: Table2 },
      { id: "query", label: "Ask Meridian", icon: SquareTerminal },
    ],
  },
  {
    label: "Ship",
    items: [
      { id: "install", label: "Tracking", icon: Settings2 },
      { id: "debug", label: "Debug", icon: Activity },
      { id: "lab", label: "Lab", icon: FlaskConical },
    ],
  },
];

export function Sidebar() {
  const view = useAnalytics((s) => s.view);
  const setView = useAnalytics((s) => s.setView);
  const projectId = useAnalytics((s) => s.projectId);
  const setProjectId = useAnalytics((s) => s.setProjectId);
  const open = useAnalytics((s) => s.sidebarOpen);
  const setOpen = useAnalytics((s) => s.setSidebarOpen);
  const collapsed = useAnalytics((s) => s.sidebarCollapsed);
  const toggleCollapsed = useAnalytics((s) => s.toggleCollapsed);
  const [picker, setPicker] = useState(false);
  const project = PROJECT_BY_ID[projectId];
  const { live } = useRealtime();

  useEffect(() => {
    if (!open) setPicker(false);
  }, [open]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-4 pt-6", collapsed && "justify-center px-2")}>
        <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative grid size-8 place-items-center rounded-md bg-elevated shadow-[var(--shadow-border)]">
            <span className="font-display text-lg italic leading-none text-fg">M</span>
            <span className="absolute inset-x-2 bottom-1.5 h-px bg-map-6/80" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-xl italic leading-none tracking-tight text-fg">
                Meridian
              </span>
              <span className="kicker mt-1 block">Analytics</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto hidden size-8 items-center justify-center rounded-md text-subtle hover:bg-elevated hover:text-fg lg:inline-flex"
        >
          <ChevronsLeft className={cn("size-4 transition-transform duration-200", collapsed && "rotate-180")} />
        </button>
      </div>

      <div className="px-2 pt-5">
        <ProjectSwitch
          projectId={projectId}
          collapsed={collapsed}
          open={picker}
          onToggle={() => setPicker((value) => !value)}
          onSelect={(id) => {
            setProjectId(id);
            setPicker(false);
          }}
        />
      </div>

      <nav className="scroll-fade thin-scroll min-h-0 flex-1 overflow-y-auto px-2 py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && <p className="kicker px-3 pb-1.5">{group.label}</p>}
            <ul>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      title={item.label}
                      onClick={() => setView(item.id)}
                      className={cn(
                        "rail flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150",
                        collapsed && "justify-center px-0",
                        active ? "is-on bg-elevated text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.id === "live" && (
                        <span className="ml-auto flex items-center gap-1.5 font-mono text-xs tabular-nums text-positive">
                          <span className="live-dot size-1.5 rounded-full bg-positive" />
                          {live.length}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-border px-4 py-4">
          <p className="kicker">Property</p>
          <p className="mt-1 truncate text-sm text-fg">{project.host}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className={cn("hidden h-dvh shrink-0 border-r border-border bg-bg lg:block", collapsed ? "w-16" : "w-60")}>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-bg/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="glass-strong relative h-full w-[min(18rem,86vw)]">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

export function SidebarTrigger() {
  const toggle = useAnalytics((s) => s.toggleSidebar);
  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={toggle}
      className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg lg:hidden"
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

function ProjectSwitch({
  projectId,
  collapsed,
  open,
  onToggle,
  onSelect,
}: {
  projectId: ProjectId;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: ProjectId) => void;
}) {
  const project = PROJECT_BY_ID[projectId];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        title={project.name}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg bg-bg px-2 py-2 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
          collapsed && "justify-center px-0",
        )}
      >
        <SiteMark id={project.id} mark={project.mark} />
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm text-fg">{project.name}</span>
              {project.live && <span className="size-1.5 shrink-0 rounded-full bg-positive" />}
            </span>
            <span className="block truncate text-xs text-subtle">{project.hint}</span>
          </span>
        )}
        {!collapsed && <ChevronsUpDown className="size-3.5 shrink-0 text-subtle" />}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-20 mt-1.5 overflow-hidden rounded-lg bg-elevated p-1 shadow-[var(--shadow-border)]",
            collapsed ? "left-0 w-56" : "inset-x-0",
          )}
        >
          {PROJECTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex h-12 w-full items-center gap-2.5 rounded-md px-2 text-left hover:bg-surface"
            >
              <SiteMark id={item.id} mark={item.mark} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-fg">{item.name}</span>
                <span className="block truncate text-xs text-subtle">{item.host}</span>
              </span>
              {item.id === projectId && <Check className="size-3.5 text-fg" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
