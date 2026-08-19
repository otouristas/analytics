import { CYCLADES_WRITE_KEY, DEMO_WRITE_KEY } from "./ingest";

export type ProjectId = "cyclades" | "demo";

export type Project = {
  id: ProjectId;
  name: string;
  mark: string;
  host: string;
  writeKey: string;
  live: boolean;
  hint: string;
  feedUrl?: string;
  shareToken: string;
};

export const PROJECTS: Project[] = [
  {
    id: "cyclades",
    name: "Discover Cyclades",
    mark: "DC",
    host: "discovercyclades.gr",
    writeKey: CYCLADES_WRITE_KEY,
    live: true,
    hint: "Guides, ferries, hotels",
    feedUrl: "https://discovercyclades.gr/api/meridian",
    shareToken: "dc",
  },
  {
    id: "demo",
    name: "Meridian Demo",
    mark: "M",
    host: "sandbox",
    writeKey: DEMO_WRITE_KEY,
    live: false,
    hint: "Sample workspace",
    shareToken: "demo",
  },
];

export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map((item) => [item.id, item])) as Record<
  ProjectId,
  Project
>;
