export type ExclusionRule = {
  id: string;
  pattern: string; // e.g. "/preview/*", "/admin/*", "127.0.0.1", "192.168.*"
  kind: "path" | "ip";
  createdAt: number;
};

export const DEFAULT_EXCLUSIONS: ExclusionRule[] = [
  { id: "ex_preview", pattern: "/preview/*", kind: "path", createdAt: Date.now() },
  { id: "ex_admin", pattern: "/admin/*", kind: "path", createdAt: Date.now() },
  { id: "ex_api_internal", pattern: "/api/internal/*", kind: "path", createdAt: Date.now() },
];

let activeExclusions: ExclusionRule[] = [...DEFAULT_EXCLUSIONS];
let droppedCount = 0;

export function getExclusions(): ExclusionRule[] {
  return [...activeExclusions];
}

export function addExclusion(pattern: string, kind: "path" | "ip"): ExclusionRule {
  const rule: ExclusionRule = {
    id: `ex_${Math.random().toString(36).slice(2, 9)}`,
    pattern,
    kind,
    createdAt: Date.now(),
  };
  activeExclusions.push(rule);
  return rule;
}

export function removeExclusion(id: string): void {
  activeExclusions = activeExclusions.filter((r) => r.id !== id);
}

export function getDroppedCount(): number {
  return droppedCount;
}

export function recordDropped(): void {
  droppedCount++;
}

/**
 * Test whether a path or IP matches any active exclusion rules.
 */
export function isExcluded(path?: string, ip?: string): boolean {
  for (const rule of activeExclusions) {
    if (rule.kind === "path" && path) {
      if (matchWildcard(rule.pattern, path)) {
        recordDropped();
        return true;
      }
    }
    if (rule.kind === "ip" && ip) {
      if (matchWildcard(rule.pattern, ip)) {
        recordDropped();
        return true;
      }
    }
  }
  return false;
}

function matchWildcard(pattern: string, text: string): boolean {
  if (pattern === text) return true;
  const regexPattern = "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
  return new RegExp(regexPattern, "i").test(text);
}
