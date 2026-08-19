export type AnnotationNote = {
  id: string;
  ts: number;
  text: string;
  author: string;
  category: "release" | "campaign" | "incident" | "general";
};

const STORAGE_KEY = "meridian_notes_v1";

const DEFAULT_NOTES: AnnotationNote[] = [
  {
    id: "n_init",
    ts: Date.now() - 3600 * 1000 * 24 * 2,
    text: "Product v2.4 Launch — Quantum Analytics & MCP Server rollout",
    author: "Team",
    category: "release",
  },
  {
    id: "n_cyclades",
    ts: Date.now() - 3600 * 1000 * 5,
    text: "New Cyclades high-speed ferry routing landing page published",
    author: "Editorial",
    category: "campaign",
  },
];

export function loadNotes(): AnnotationNote[] {
  if (typeof window === "undefined") return DEFAULT_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTES;
    const parsed = JSON.parse(raw) as AnnotationNote[];
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

export function saveNotes(notes: AnnotationNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* noop */
  }
}

export function createNote(text: string, category: AnnotationNote["category"] = "general", author = "Admin"): AnnotationNote {
  // Sanitize text as plain string data, not prompts or executable code
  const clean = text.replace(/<[^>]*>?/gm, "").trim().slice(0, 240);
  const note: AnnotationNote = {
    id: `note_${Math.random().toString(36).slice(2, 9)}`,
    ts: Date.now(),
    text: clean,
    author: author.trim().slice(0, 40) || "Admin",
    category,
  };
  const list = [note, ...loadNotes()];
  saveNotes(list);
  return note;
}

export function deleteNote(id: string): void {
  const list = loadNotes().filter((n) => n.id !== id);
  saveNotes(list);
}
