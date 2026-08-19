import { downloadCsv, eventsToCsv } from "@/lib/analytics/export";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { Button } from "@/components/ui/button";

export function ExportBar() {
  const { events, project } = useRealtime();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!events.length}
      onClick={() =>
        downloadCsv(
          `${project.host.replace(/\W+/g, "-")}-meridian.csv`,
          eventsToCsv(events),
        )
      }
    >
      Export CSV · {events.length}
    </Button>
  );
}
