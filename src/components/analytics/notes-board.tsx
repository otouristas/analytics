import { useState, useEffect } from "react";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { Button } from "@/components/ui/button";
import { loadNotes, createNote, deleteNote, type AnnotationNote } from "@/lib/analytics/notes";
import { MessageSquare, Plus, Trash2, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotesBoard() {
  const { project } = useRealtime();
  const [notes, setNotes] = useState<AnnotationNote[]>([]);
  const [newText, setNewText] = useState("");
  const [category, setCategory] = useState<AnnotationNote["category"]>("release");
  const [author, setAuthor] = useState("Marketing Team");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const item = createNote(newText, category, author);
    setNotes([item, ...notes]);
    setNewText("");
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <PageShell
      kicker={`Annotations · ${project.host}`}
      title="Timeline Notes &amp; Releases"
      dek="Add timestamped contextual notes (marketing launches, deployments, campaign spikes) overlaid on performance sparklines and Pulse KPIs."
    >
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-surface/50 p-5">
          <p className="kicker">Add New Annotation</p>
          <form onSubmit={handleAdd} className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1">Note / Event Description</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g. Launched new Instagram influencer campaign or server migration..."
                rows={3}
                className="w-full rounded-lg border border-border bg-bg p-3 text-xs text-fg outline-none focus:border-positive/50 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {(["release", "campaign", "incident", "general"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-xs capitalize font-medium transition-all",
                      category === cat ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:bg-elevated/40",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-fg outline-none focus:border-positive/50"
              />
            </div>

            <Button type="submit" size="sm" className="w-full" disabled={!newText.trim()}>
              <Plus className="mr-1 size-3.5" /> Save Annotation Note
            </Button>
          </form>
        </div>

        {/* Notes Timeline List */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/50 p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="kicker">Historical Annotations ({notes.length})</p>
            <span className="text-xs text-subtle">Stored in property database</span>
          </div>

          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notes.length === 0 && (
              <div className="p-8 text-center text-sm text-subtle">
                <MessageSquare className="mx-auto size-8 opacity-40 mb-2" />
                No annotations added yet.
              </div>
            )}
            {notes.map((note) => (
              <div key={note.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-bg/80 p-4 transition-colors hover:border-border/80">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded bg-elevated px-2 py-0.5 font-mono text-[10px] text-muted capitalize">
                      <Tag className="size-2.5" /> {note.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-subtle">
                      <Calendar className="size-2.5" /> {new Date(note.ts).toLocaleDateString()} {new Date(note.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] text-subtle">by {note.author}</span>
                  </div>
                  <p className="text-sm font-medium text-fg leading-snug">{note.text}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  aria-label="Delete note"
                  className="rounded p-1 text-subtle hover:text-danger transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
