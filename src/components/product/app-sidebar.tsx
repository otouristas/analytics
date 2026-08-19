import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MeridianLogo } from "@/components/ui/meridian-logo";
import { PROJECTS, PROJECT_BY_ID, type ProjectId } from "@/lib/analytics/projects";
import { useAnalytics, type WorkspaceView } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import {
  Activity,
  BarChart3,
  Bot,
  Check,
  ChevronsLeft,
  ChevronsUpDown,
  Compass,
  FileText,
  Filter,
  FlaskConical,
  GitBranch,
  Globe2,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  MousePointerClick,
  PanelLeft,
  Radio,
  Search,
  Settings2,
  Share2,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  SquareTerminal,
  StickyNote,
  Table2,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS: { label: string; items: { id: WorkspaceView; label: string; icon: any; badge?: string }[] }[] = [
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
      { id: "attribution", label: "Attribution", icon: GitBranch },
      { id: "pages", label: "Pages", icon: FileText },
      { id: "seo", label: "Search Intelligence", icon: Search },
      { id: "searchconsole", label: "Search Console", icon: Globe2 },
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
      { id: "radar", label: "Anomaly Radar", icon: ShieldAlert },
      { id: "forecast", label: "Forecast", icon: TrendingUp },
      { id: "opportunities", label: "Opportunities", icon: Sparkles },
      { id: "cause", label: "Root Cause", icon: Compass },
      { id: "intent", label: "Intent", icon: Compass },
      { id: "demand", label: "Destinations", icon: Compass },
      { id: "reports", label: "Reports", icon: Table2 },
      { id: "query", label: "Ask Meridian", icon: SquareTerminal },
    ],
  },
  {
    label: "Connect",
    items: [
      { id: "integrations", label: "Integrations", icon: Layers },
      { id: "bots", label: "Bot Sentinel", icon: Bot },
      { id: "notes", label: "Timeline Notes", icon: StickyNote },
      { id: "widgets", label: "Embed Widgets", icon: LayoutGrid },
    ],
  },
  {
    label: "Ship",
    items: [
      { id: "install", label: "Tracking & Snippets", icon: Settings2 },
      { id: "debug", label: "Debug", icon: Activity },
      { id: "lab", label: "Lab", icon: FlaskConical },
    ],
  },
];

export function AppSidebar() {
  const view = useAnalytics((s) => s.view);
  const setView = useAnalytics((s) => s.setView);
  const projectId = useAnalytics((s) => s.projectId);
  const setProjectId = useAnalytics((s) => s.setProjectId);
  const open = useAnalytics((s) => s.sidebarOpen);
  const setOpen = useAnalytics((s) => s.setSidebarOpen);
  const collapsed = useAnalytics((s) => s.sidebarCollapsed);
  const toggleCollapsed = useAnalytics((s) => s.toggleCollapsed);
  const [pickerOpen, setPickerOpen] = useState(false);
  const project = PROJECT_BY_ID[projectId];
  const { live } = useRealtime();

  useEffect(() => {
    if (!open) setPickerOpen(false);
  }, [open]);

  const navContent = (
    <div className="flex h-full flex-col bg-surface select-none">
      {/* Brand & collapse trigger */}
      <div className={cn("flex items-center justify-between p-4 pb-3", collapsed && "justify-center p-2.5")}>
        <Link to="/app" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <MeridianLogo variant={collapsed ? "mark" : "full"} size="md" />
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="hidden lg:flex size-7 items-center justify-center rounded-lg text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Property Switcher */}
      <div className="px-2.5 pb-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl border border-border bg-elevated/60 p-2 text-left hover:border-border-strong hover:bg-elevated transition-all shadow-xs",
              collapsed && "justify-center px-0",
            )}
          >
            <div className="flex size-6 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-white uppercase shrink-0">
              {project.mark}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-fg">{project.name}</span>
                  {project.live && <span className="size-1.5 rounded-full bg-positive" />}
                </div>
                <span className="block truncate text-[11px] text-muted">{project.host}</span>
              </div>
            )}

            {!collapsed && <ChevronsUpDown className="size-3.5 text-muted shrink-0" />}
          </button>

          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
              <div
                className={cn(
                  "absolute z-40 mt-1.5 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl",
                  collapsed ? "left-0 w-52" : "inset-x-0",
                )}
              >
                {PROJECTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProjectId(item.id);
                      setPickerOpen(false);
                    }}
                    className="flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-subtle-surface transition-colors"
                  >
                    <div className="flex size-5 items-center justify-center rounded bg-accent/20 text-[10px] font-semibold text-accent">
                      {item.mark}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-fg">{item.name}</span>
                    </div>
                    {item.id === projectId && <Check className="size-3 text-accent" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Group Items */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4 thin-scroll">
        {GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="kicker px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-subtle">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      title={item.label}
                      onClick={() => {
                        setView(item.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "rail flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "is-on bg-elevated text-fg font-semibold shadow-xs"
                          : "text-muted hover:bg-subtle-surface hover:text-fg",
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.id === "live" && (
                        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-positive">
                          <span className="live-dot size-1 rounded-full bg-positive" />
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

      {/* Footer Profile & Links */}
      {!collapsed && (
        <div className="border-t border-border p-3 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-xs">
              G
            </div>
            <div className="min-w-0">
              <span className="block truncate font-medium text-fg">Giorgio D.</span>
              <span className="caption block truncate text-[10px]">Owner</span>
            </div>
          </div>

          <Link to="/" className="text-subtle hover:text-fg p-1">
            <HelpCircle className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden h-dvh shrink-0 border-r border-border bg-surface lg:block transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r border-border bg-surface shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
