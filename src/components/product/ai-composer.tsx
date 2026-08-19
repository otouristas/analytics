import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useAnalytics } from "@/lib/analytics/store";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { cn } from "@/lib/utils";

export function AIComposer({
  onSend,
  placeholder = "Ask anything about your business or Search Console...",
  className,
}: {
  onSend?: (query: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const projectId = useAnalytics((s) => s.projectId);
  const project = PROJECT_BY_ID[projectId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative rounded-2xl border border-border bg-surface shadow-md p-2", className)}>
      {/* Context indicator pill */}
      <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
        <Sparkles className="size-3 text-accent" />
        <span className="caption font-medium text-accent">Context:</span>
        <span className="caption font-mono text-fg">{project.host}</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-fg outline-none placeholder:text-subtle font-sans"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex size-7 items-center justify-center rounded-xl bg-accent text-white shadow-xs hover:bg-accent/90 disabled:opacity-40 transition-all duration-150 active:scale-95"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </form>
  );
}
