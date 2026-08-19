import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  Search,
  LayoutDashboard,
  Compass,
  FileText,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Bot,
  Settings2,
  TrendingUp,
  Globe2,
  Moon,
  Sun,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAnalytics, type WorkspaceView } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (view: WorkspaceView) => void;
}) {
  const [query, setQuery] = useState("");
  const setView = useAnalytics((s) => s.setView);
  const toggleTheme = useAnalytics((s) => s.toggleTheme);
  const theme = useAnalytics((s) => s.theme);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const select = (view: WorkspaceView) => {
    setView(view);
    onNavigate?.(view);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16 sm:pt-24 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />

      <Command
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        label="Meridian Global Search"
      >
        <div className="flex items-center border-b border-border px-3.5">
          <Search className="size-4 text-muted mr-2.5 shrink-0" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search metrics, pages, properties, or actions... (⌘K)"
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle font-sans"
          />
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2 text-xs thin-scroll">
          <Command.Empty className="py-8 text-center text-muted">No matching results found.</Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            <Item icon={LayoutDashboard} label="Overview & Meridian Pulse" onSelect={() => select("overview")} />
            <Item icon={Globe2} label="Earth Realtime Stream" onSelect={() => select("atlas")} />
            <Item icon={Search} label="Search Intelligence (GSC)" onSelect={() => select("seo")} />
            <Item icon={Sparkles} label="Opportunities & SEO Actions" onSelect={() => select("opportunities")} />
            <Item icon={ShieldAlert} label="Autonomous Anomaly Radar" onSelect={() => select("radar")} />
            <Item icon={TrendingUp} label="Holt-Winters Predictive Forecast" onSelect={() => select("forecast")} />
            <Item icon={FileText} label="Pages & Landing Quality" onSelect={() => select("pages")} />
            <Item icon={BarChart3} label="Acquisition & Traffic Sources" onSelect={() => select("sources")} />
            <Item icon={Layers} label="Integrations & Webhooks" onSelect={() => select("integrations")} />
            <Item icon={Bot} label="Ask Meridian Copilot" onSelect={() => select("query")} />
          </Command.Group>

          <Command.Group heading="Actions" className="mt-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            <Item
              icon={theme === "dark" ? Sun : Moon}
              label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onSelect={() => {
                toggleTheme();
                onOpenChange(false);
              }}
            />
            <Item icon={Settings2} label="Tracking Settings & Snippets" onSelect={() => select("install")} />
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({ icon: Icon, label, onSelect }: { icon: any; label: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-fg hover:bg-subtle-surface data-[selected=true]:bg-subtle-surface transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <Icon className="size-3.5 text-muted" />
        <span className="font-medium text-xs text-fg">{label}</span>
      </div>
      <ArrowRight className="size-3 text-subtle" />
    </Command.Item>
  );
}
