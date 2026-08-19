import { eventArt, pageArt, projectIcon } from "@/lib/analytics/visuals";
import { cn } from "@/lib/utils";

export function SiteMark({
  id,
  mark,
  size = "md",
}: {
  id: string;
  mark: string;
  size?: "sm" | "md";
}) {
  const src = projectIcon(id);
  const box = size === "sm" ? "size-7" : "size-8";
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(box, "shrink-0 rounded-md object-cover shadow-[var(--shadow-border)]")}
      />
    );
  }
  return (
    <span
      className={cn(
        box,
        "inline-grid shrink-0 place-items-center rounded-md bg-elevated font-mono text-xs text-fg",
      )}
    >
      {mark}
    </span>
  );
}

export function PageThumb({
  path,
  title,
  className,
}: {
  path: string;
  title?: string;
  className?: string;
}) {
  return <img src={pageArt(path, title)} alt="" className={cn("object-cover", className)} />;
}

export function EventThumb({
  kind,
  label,
  className,
}: {
  kind: string;
  label?: string;
  className?: string;
}) {
  return <img src={eventArt(kind, label)} alt="" className={cn("object-cover", className)} />;
}
