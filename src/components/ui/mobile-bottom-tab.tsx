import { Search, Sparkles, Bot, BarChart3, LayoutDashboard } from "lucide-react";
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

/**
 * The floating glass dock.
 *
 * Each tab is an equal-width column so the five labels sit on a fixed rhythm
 * regardless of word length — "Opportunities" is more than twice the width of
 * "Ask", and `justify-around` let that drag the whole row off-centre. Labels
 * scale down rather than wrap, because a wrapped label changes the dock's
 * height and makes it jump.
 */
export function MobileBottomTab({ activeTab, onTabChange, className }: MobileBottomTabProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn("mobile-dock grid grid-cols-5 gap-0.5 md:hidden", className)}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1.5",
              "transition-[background,color,transform] duration-200 ease-[var(--ease-out-soft)] active:scale-[0.94]",
              isActive ? "dock-tab-active text-accent" : "text-muted",
            )}
          >
            <Icon
              className={cn(
                "size-[1.125rem] shrink-0 transition-transform duration-200 ease-[var(--ease-out-soft)]",
                isActive && "-translate-y-px scale-105",
              )}
              strokeWidth={isActive ? 2.25 : 1.75}
            />
            <span
              className={cn(
                "max-w-full truncate text-[10px] leading-none tracking-tight",
                isActive ? "font-semibold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
