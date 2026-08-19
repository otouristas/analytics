import { Bell, Check, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: "opportunity" | "warning" | "success" | "tracking";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Paros organic demand surging",
    description: "Qualified sessions to /paros-guide increased +31% over the last 48 hours.",
    time: "10m ago",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Mobile Safari conversion dip",
    description: "Conversion rate dropped 19% on iOS devices following the latest release.",
    time: "2h ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Search Console sync complete",
    description: "48,291 search clicks matched to 32,841 qualified sessions.",
    time: "5h ago",
    read: true,
  },
  {
    id: "4",
    type: "tracking",
    title: "Bot Sentinel blocked 142 scrapers",
    description: "Automated crawler spikes filtered from core conversion metrics.",
    time: "1d ago",
    read: true,
  },
];

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l border-border bg-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-fg" />
            <h3 className="text-sm font-semibold text-fg">Notifications</h3>
            <span className="rounded-full bg-accent-soft px-1.5 py-0.2 text-[10px] font-semibold text-accent">
              {notifications.filter((n) => !n.read).length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-medium text-muted hover:text-fg transition-colors px-2 py-1"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 thin-scroll">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markRead(item.id)}
              className={cn(
                "group relative rounded-xl border p-3 transition-all cursor-pointer",
                item.read
                  ? "border-border/60 bg-surface/50 opacity-80"
                  : "border-border bg-surface shadow-xs hover:border-border-strong",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {item.type === "opportunity" && <Sparkles className="size-3.5 text-accent" />}
                  {item.type === "warning" && <AlertTriangle className="size-3.5 text-warning" />}
                  {item.type === "success" && <CheckCircle2 className="size-3.5 text-positive" />}
                  {item.type === "tracking" && <ShieldAlert className="size-3.5 text-muted" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={cn("text-xs font-semibold tracking-tight", item.read ? "text-muted" : "text-fg")}>
                      {item.title}
                    </h4>
                    <span className="caption shrink-0 text-[10px]">{item.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted leading-relaxed font-normal">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
