import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  PanelLeft,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CommandPalette } from "@/components/ui/command-palette";
import { NotificationPanel } from "@/components/ui/notification-panel";
import { useAnalytics } from "@/lib/analytics/store";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";

export function AppHeader({ onOpenAIPanel }: { onOpenAIPanel?: () => void }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const theme = useAnalytics((s) => s.theme);
  const toggleTheme = useAnalytics((s) => s.toggleTheme);
  const toggleSidebar = useAnalytics((s) => s.toggleSidebar);
  const projectId = useAnalytics((s) => s.projectId);
  const view = useAnalytics((s) => s.view);
  const project = PROJECT_BY_ID[projectId];
  const { live } = useRealtime();

  const viewLabels: Record<string, string> = {
    overview: "Overview",
    atlas: "Realtime Earth",
    live: "Live Visitors",
    sources: "Acquisition",
    attribution: "Attribution",
    pages: "Pages",
    seo: "Search Intelligence",
    events: "Events",
    conversions: "Goals",
    funnels: "Funnels",
    flow: "Customer Journeys",
    devices: "Performance",
    engagement: "Engagement",
    campaigns: "Campaigns",
    commerce: "Revenue",
    cohorts: "Cohorts",
    segments: "Segments",
    radar: "Anomaly Radar",
    forecast: "Predictive Forecast",
    opportunities: "Opportunities",
    cause: "Root Cause",
    intent: "Intent",
    demand: "Destinations",
    reports: "Reports",
    query: "Ask Meridian",
    integrations: "Integrations",
    bots: "Bot Sentinel",
    notes: "Timeline Notes",
    widgets: "Embed Widgets",
    install: "Tracking",
    debug: "Debug",
    lab: "Lab",
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 select-none">
        {/* Left: Mobile menu toggle + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            className="flex lg:hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle-surface hover:text-fg"
          >
            <PanelLeft className="size-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-muted truncate">
            <span className="font-semibold text-fg truncate">{project.name}</span>
            <ChevronRight className="size-3 text-subtle shrink-0" />
            <span className="truncate capitalize">{viewLabels[view] ?? view}</span>
          </div>

          {/* Live pulse indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-positive-soft px-2.5 py-0.5 text-[11px] font-medium text-positive">
            <span className="live-dot size-1.5 rounded-full bg-positive" />
            <span>{live.length} live</span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-8 w-full items-center justify-between rounded-lg border border-border bg-elevated/40 px-3 text-xs text-muted hover:border-border-strong hover:bg-elevated transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5" />
              <span>Search metrics, reports...</span>
            </span>
            <kbd className="caption rounded border border-border bg-surface px-1.5 py-0.2 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Date Picker, Theme, Notifications, AI Copilot */}
        <div className="flex items-center gap-2">
          <DateRangePicker className="hidden sm:inline-block" />

          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Search"
            className="flex md:hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle-surface hover:text-fg"
          >
            <Search className="size-4" />
          </button>

          {/* Notifications bell */}
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" />
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Switch Theme"
            className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* Ask Meridian trigger button */}
          <button
            type="button"
            onClick={onOpenAIPanel}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 transition-all duration-150 active:scale-95"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">Ask Meridian</span>
          </button>
        </div>
      </header>

      {/* Global Overlays */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
