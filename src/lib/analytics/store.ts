import { create } from "zustand";
import type { IngestEvent } from "./ingest";
import type { StreamWindow } from "./insights";
import type { MetricId, RangeId } from "./model";
import type { ProjectId } from "./projects";

export type WorkspaceView =
  | "overview"
  | "atlas"
  | "live"
  | "sources"
  | "pages"
  | "events"
  | "conversions"
  | "flow"
  | "funnels"
  | "opportunities"
  | "devices"
  | "campaigns"
  | "commerce"
  | "cohorts"
  | "alerts"
  | "debug"
  | "seo"
  | "cause"
  | "intent"
  | "reports"
  | "query"
  | "lab"
  | "install"
  | "segments"
  | "engagement"
  | "demand";
export type ThemeId = "dark" | "light";
export type ProjectionId = "globe" | "flat";
export type FeedStatus = "connecting" | "live" | "empty" | "error";

type AnalyticsState = {
  metric: MetricId;
  range: RangeId;
  streamWindow: StreamWindow;
  selectedId: string | null;
  view: WorkspaceView;
  sourceId: string | null;
  sessionId: string | null;
  theme: ThemeId;
  projection: ProjectionId;
  projectId: ProjectId;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  events: IngestEvent[];
  feedStatus: FeedStatus;
  deviceFilter: "all" | "desktop" | "mobile";
  countryFilter: string;
  channelFilter: string;
  pathFilter: string;
  conversionContains: string;
  setMetric: (metric: MetricId) => void;
  setRange: (range: RangeId) => void;
  setStreamWindow: (streamWindow: StreamWindow) => void;
  setSelectedId: (id: string | null) => void;
  toggleSelected: (id: string) => void;
  setView: (view: WorkspaceView) => void;
  setSourceId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  setTheme: (theme: ThemeId) => void;
  toggleTheme: () => void;
  setProjection: (projection: ProjectionId) => void;
  setProjectId: (projectId: ProjectId) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  setFeed: (events: IngestEvent[], status: FeedStatus) => void;
  setDeviceFilter: (deviceFilter: "all" | "desktop" | "mobile") => void;
  setCountryFilter: (countryFilter: string) => void;
  setChannelFilter: (channelFilter: string) => void;
  setPathFilter: (pathFilter: string) => void;
  setConversionContains: (conversionContains: string) => void;
};

export const useAnalytics = create<AnalyticsState>((set, get) => ({
  metric: "users",
  range: "90d",
  streamWindow: "all",
  selectedId: null,
  view: "overview",
  sourceId: null,
  sessionId: null,
  theme: "dark",
  projection: "globe",
  projectId: "cyclades",
  sidebarOpen: false,
  sidebarCollapsed: false,
  events: [],
  feedStatus: "connecting",
  deviceFilter: "all",
  countryFilter: "",
  channelFilter: "all",
  pathFilter: "",
  conversionContains: "book",
  setMetric: (metric) => set({ metric }),
  setRange: (range) => set({ range }),
  setStreamWindow: (streamWindow) => set({ streamWindow }),
  setSelectedId: (selectedId) => set({ selectedId }),
  toggleSelected: (id) => set({ selectedId: get().selectedId === id ? null : id }),
  setView: (view) => set({ view, sidebarOpen: false }),
  setSourceId: (sourceId) => set({ sourceId }),
  setSessionId: (sessionId) => set({ sessionId }),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", next === "light");
    }
    set({ theme: next });
  },
  setProjection: (projection) => set({ projection }),
  setProjectId: (projectId) => set({ projectId, events: [], feedStatus: "connecting" }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toggleCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setFeed: (events, feedStatus) => set({ events, feedStatus }),
  setDeviceFilter: (deviceFilter) => set({ deviceFilter }),
  setCountryFilter: (countryFilter) => set({ countryFilter }),
  setChannelFilter: (channelFilter) => set({ channelFilter }),
  setPathFilter: (pathFilter) => set({ pathFilter }),
  setConversionContains: (conversionContains) => set({ conversionContains }),
}));
