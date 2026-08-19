import type { ReactNode } from "react";
import { FolderSearch, Plus, Search, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-surface/40",
        className,
      )}
    >
      <div className="mb-3.5 flex size-11 items-center justify-center rounded-full bg-subtle-surface text-muted">
        {icon ?? <FolderSearch className="size-5" />}
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-fg tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted leading-relaxed">{description}</p>

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-accent/90 transition-colors"
            >
              {action.icon ?? <Plus className="size-3.5" />}
              <span>{action.label}</span>
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-fg hover:bg-elevated transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
