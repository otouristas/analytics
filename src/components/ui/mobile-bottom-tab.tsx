import { LayoutDashboard, Compass, Search, Sparkles, Bot, BarChart3, Target, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTabId = "home" | "analytics" | "search" | "opportunities" | "ai";

interface MobileBottomTabProps {
  activeTab: MobileTabId;
  onTabChange: (tab: MobileTabId) => void;
  className?: string;
}

const TABS: { id: MobileTabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "search", label: "Search", icon: Search },
  { id: "opportunities", label: "Opportunities", icon: Sparkles },
  { id: "ai", label: "Ask", icon: Bot },
];

export function MobileBottomTab({ activeTab, onTabChange, className }: MobileBottomTabProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "mobile-dock flex items-center justify-around md:hidden",
        className,
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all duration-150 active:scale-95",
              isActive ? "text-accent" : "text-muted hover:text-fg",
            )}
          >
            <Icon className={cn("size-5 transition-transform duration-150", isActive && "scale-110")} />
            <span className="text-[10px] font-medium tracking-tight leading-none">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0.5 size-1 rounded-full bg-accent animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
