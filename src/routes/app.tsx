import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/product/app-sidebar";
import { AppHeader } from "@/components/product/app-header";
import { AIPanel } from "@/components/product/ai-panel";
import { MobileBottomTab, type MobileTabId } from "@/components/ui/mobile-bottom-tab";
import { useAnalytics, type WorkspaceView } from "@/lib/analytics/store";
import { useLiveFeed } from "@/lib/analytics/use-live-feed";
import { Dashboard } from "@/components/analytics/dashboard";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const view = useAnalytics((s) => s.view);
  const setView = useAnalytics((s) => s.setView);
  useLiveFeed();

  // Map mobile tabs to workspace views
  const activeMobileTab: MobileTabId =
    view === "overview" || view === "atlas"
      ? "home"
      : view === "sources" || view === "pages" || view === "events"
        ? "analytics"
        : view === "seo"
          ? "search"
          : view === "opportunities" || view === "radar" || view === "forecast"
            ? "opportunities"
            : "ai";

  const handleMobileTabChange = (tab: MobileTabId) => {
    switch (tab) {
      case "home":
        setView("overview");
        break;
      case "analytics":
        setView("sources");
        break;
      case "search":
        setView("seo");
        break;
      case "opportunities":
        setView("opportunities");
        break;
      case "ai":
        setView("query");
        break;
    }
  };

  return (
    <div className="flex min-h-dvh bg-bg text-fg lg:h-dvh lg:overflow-hidden select-none font-sans antialiased">
      {/* Desktop App Sidebar */}
      <AppSidebar />

      {/* Main App Workspace Canvas */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Global Product Header */}
        <AppHeader onOpenAIPanel={() => setAiOpen(true)} />

        {/* Dashboard Workspace Boards */}
        {/* `dock-safe` reserves exactly the floating dock's height plus the
            safe-area inset, so the last row of every board clears it. */}
        <div className="dock-safe flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Dashboard hideChrome />
        </div>

        {/* Slide-in Contextual AI Copilot */}
        <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />

        {/* Mobile Glass Bottom Tab Navigation */}
        <MobileBottomTab
          activeTab={activeMobileTab}
          onTabChange={handleMobileTabChange}
        />
      </div>
    </div>
  );
}
