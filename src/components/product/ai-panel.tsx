import { useState } from "react";
import { Sparkles, X, Bot, CheckCircle2, ArrowRight, ShieldAlert, TrendingUp } from "lucide-react";
import { AIComposer } from "./ai-composer";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export function AIPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; evidence?: string[]; actions?: string[] }[]
  >([
    {
      role: "assistant",
      text: "I am Meridian AI. I analyze your Search Console queries, visitor sessions, and revenue drivers in real time. How can I help you today?",
    },
  ]);

  const handleSend = (query: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: query },
      {
        role: "assistant",
        text: "Organic qualified sessions grew +18.7% this week across Cycladic hotel and car rental guides. Zero indexing regressions detected.",
        evidence: [
          "GSC Clicks: +14.2% on 'santorini hotels' and 'paros ferries'",
          "Conversion Velocity: 4.82% (+0.41% vs prior period)",
          "Mobile Performance: LCP healthy at 1.8s",
        ],
        actions: [
          "Double down on Paros high-intent guide internal links",
          "Review Sifnos hotel outbound click tracking",
        ],
      },
    ]);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md sm:max-w-lg border-l border-border bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Bot className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">Ask Meridian</h3>
              <p className="caption text-[11px]">Context-Aware Analytics Copilot</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scroll">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-1.5",
                msg.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-white"
                    : "border border-border bg-elevated/70 text-fg shadow-xs",
                )}
              >
                <p>{msg.text}</p>

                {msg.evidence && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <span className="caption block uppercase font-semibold text-accent mb-1">Evidence & Verification</span>
                    <ul className="space-y-1 text-muted">
                      {msg.evidence.map((ev, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3 text-positive shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.actions && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <span className="caption block uppercase font-semibold text-fg mb-1">Recommended Next Steps</span>
                    <ul className="space-y-1 text-muted">
                      {msg.actions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ArrowRight className="size-3 text-accent shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 border-t border-border/60 bg-surface/50">
          <p className="caption mb-1.5 font-medium">Suggested queries:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Why did organic traffic change?",
              "Which pages have highest business value?",
              "What changed after the last deployment?",
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="rounded-lg border border-border bg-elevated/50 px-2 py-1 text-[11px] text-muted hover:border-border-strong hover:text-fg transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Composer at bottom */}
        <div className="p-4 border-t border-border bg-surface">
          <AIComposer onSend={handleSend} />
        </div>
      </aside>
    </>
  );
}
