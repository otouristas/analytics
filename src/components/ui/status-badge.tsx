import { CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Radio, Shield, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "healthy"
  | "watch"
  | "critical"
  | "syncing"
  | "connected"
  | "disconnected"
  | "live"
  | "draft"
  | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const displayLabel = label ?? defaultLabel(status);

  return (
    <span
      className={cn(
        "status-badge inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        status === "healthy" && "status-badge--healthy",
        status === "connected" && "status-badge--healthy",
        status === "live" && "status-badge--healthy",
        status === "watch" && "status-badge--watch",
        status === "critical" && "status-badge--critical",
        status === "disconnected" && "status-badge--critical",
        status === "syncing" && "status-badge--accent",
        status === "draft" && "status-badge--neutral",
        status === "neutral" && "status-badge--neutral",
        className,
      )}
    >
      <StatusIcon status={status} size={size} />
      <span>{displayLabel}</span>
    </span>
  );
}

function StatusIcon({ status, size }: { status: StatusType; size: "sm" | "md" }) {
  const iconSize = size === "sm" ? "size-3" : "size-3.5";

  switch (status) {
    case "healthy":
    case "connected":
      return <CheckCircle2 className={cn(iconSize, "text-positive")} />;
    case "live":
      return (
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-positive" />
        </span>
      );
    case "watch":
      return <AlertTriangle className={cn(iconSize, "text-warning")} />;
    case "critical":
    case "disconnected":
      return <AlertCircle className={cn(iconSize, "text-danger")} />;
    case "syncing":
      return <RefreshCw className={cn(iconSize, "animate-spin text-accent")} />;
    case "draft":
    case "neutral":
      return <Shield className={cn(iconSize, "text-muted")} />;
    default:
      return <HelpCircle className={cn(iconSize, "text-muted")} />;
  }
}

function defaultLabel(status: StatusType): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "watch":
      return "Watch";
    case "critical":
      return "Critical";
    case "syncing":
      return "Syncing";
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    case "live":
      return "Live";
    case "draft":
      return "Draft";
    case "neutral":
      return "Stable";
  }
}
