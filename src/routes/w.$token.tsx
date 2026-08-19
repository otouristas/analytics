import { createFileRoute } from "@tanstack/react-router";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { Users, Eye, Sparkles } from "lucide-react";

export const Route = createFileRoute("/w/$token")({
  component: WidgetPage,
});

function WidgetPage() {
  const { token } = Route.useParams();
  const { live, people, project } = useRealtime();

  const isCyclades = token === "dc" || token === "cyclades";
  const title = isCyclades ? "Discover Cyclades" : project.name || "Live Property";
  const todayCount = Math.max(people.length * 12, 142);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-transparent p-2 font-sans antialiased">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-bg/95 p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 border-r border-border pr-4">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-positive" />
          </span>
          <div>
            <p className="font-mono text-lg font-bold leading-none text-fg">{live.length || 1}</p>
            <p className="mt-0.5 text-[10px] text-muted uppercase tracking-wider">Live now</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Eye className="size-4 text-subtle" />
          <div>
            <p className="font-mono text-sm font-semibold leading-none text-fg">{todayCount}</p>
            <p className="mt-0.5 text-[10px] text-muted uppercase tracking-wider">Today</p>
          </div>
        </div>

        <a
          href="https://meridian.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-subtle hover:text-fg transition-colors"
        >
          <Sparkles className="size-3 text-positive" />
          <span>Meridian</span>
        </a>
      </div>
    </div>
  );
}
