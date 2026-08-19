import { requireSupabase } from "./client";
import type { GscProperty, SeoProject } from "./types";

/**
 * Google Search Console: listing properties from Google, importing them, and
 * matching them to Meridian properties.
 *
 * The listing call goes through the `gsc-sites` edge function rather than
 * straight to Google. That function holds the service-role key needed to read
 * and REFRESH the user's stored Google token — an access token lasts an hour,
 * so a browser-side call would start failing an hour after sign-in.
 */

/** One property as Google reports it. */
export interface GoogleSite {
  siteUrl: string;
  permissionLevel: string;
}

/** A Search Console property is either a whole domain or one URL prefix. */
export type GscPropertyKind = "domain" | "url-prefix";

export function propertyKind(siteUrl: string): GscPropertyKind {
  return siteUrl.startsWith("sc-domain:") ? "domain" : "url-prefix";
}

/**
 * The bare host behind a Search Console property id.
 *
 *   sc-domain:example.com      -> example.com
 *   https://www.example.com/   -> example.com
 *
 * `www` is dropped because Search Console treats `https://www.x.com/` and
 * `sc-domain:x.com` as different properties for the same site, and matching
 * has to see through that.
 */
export function hostOf(siteUrl: string): string {
  const raw = siteUrl.startsWith("sc-domain:")
    ? siteUrl.slice("sc-domain:".length)
    : siteUrl;
  const withoutScheme = raw.replace(/^https?:\/\//, "");
  const host = withoutScheme.split("/")[0] ?? "";
  return host.replace(/^www\./, "").toLowerCase();
}

/** Only Google can grant these; anything less cannot read performance data. */
export function canReadData(permissionLevel: string): boolean {
  return permissionLevel !== "siteUnverifiedUser";
}

/**
 * Every Search Console property on the signed-in user's Google account.
 *
 * Throws with Google's own message when the token is missing or expired, since
 * "reconnect Google" is the only useful action and the UI should say so.
 */
export async function listGoogleSites(): Promise<GoogleSite[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke<{ sites?: GoogleSite[] }>(
    "gsc-sites",
    { body: {} },
  );
  if (error) throw new Error(describeFunctionError(error));
  return data?.sites ?? [];
}

/** Edge-function errors arrive with the useful text inside the response body. */
function describeFunctionError(error: unknown): string {
  if (error && typeof error === "object") {
    const ctx = (error as { context?: { body?: unknown } }).context;
    if (typeof ctx?.body === "string" && ctx.body) {
      try {
        const parsed = JSON.parse(ctx.body) as { error?: string };
        if (parsed.error) return parsed.error;
      } catch {
        return ctx.body;
      }
    }
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Could not reach Google Search Console.";
}

/**
 * Import the chosen properties.
 *
 * Upserted on (user_id, site_url) so re-importing refreshes permission level
 * and verification instead of creating duplicates.
 */
export async function importGscProperties(
  userId: string,
  sites: GoogleSite[],
): Promise<number> {
  if (sites.length === 0) return 0;
  const supabase = requireSupabase();

  const rows = sites.map((site) => ({
    user_id: userId,
    site_url: site.siteUrl,
    permission_level: site.permissionLevel,
    verified: canReadData(site.permissionLevel),
    selected: true,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("gsc_properties")
    .upsert(rows, { onConflict: "user_id,site_url" });
  if (error) throw new Error(`Could not import properties: ${error.message}`);
  return rows.length;
}

/** Attach an imported Search Console property to a Meridian property. */
export async function linkPropertyToProject(
  gscPropertyId: string,
  seoProjectId: string | null,
): Promise<void> {
  const { error } = await requireSupabase()
    .from("gsc_properties")
    .update({ seo_project_id: seoProjectId, updated_at: new Date().toISOString() })
    .eq("id", gscPropertyId);
  if (error) throw new Error(`Could not link property: ${error.message}`);
}

export interface PropertyMatch {
  property: GscProperty;
  project: SeoProject | null;
  /** 0–100. 100 is an exact host match. */
  confidence: number;
  status: "matched" | "needs-review" | "linked";
}

/**
 * Pair each imported Search Console property with the Meridian property that
 * most likely describes the same site.
 *
 * Confidence is deliberately conservative: only an exact host match is treated
 * as certain. A shared registrable domain (a subdomain on either side) scores
 * high enough to suggest but low enough to still ask, because `blog.x.com` and
 * `shop.x.com` are genuinely different properties.
 */
export function matchProperties(
  properties: GscProperty[],
  projects: SeoProject[],
): PropertyMatch[] {
  return properties.map((property) => {
    // An explicit link the user already confirmed always wins.
    if (property.seo_project_id) {
      const linked = projects.find((p) => p.id === property.seo_project_id) ?? null;
      if (linked) return { property, project: linked, confidence: 100, status: "linked" };
    }

    const host = hostOf(property.site_url);
    let best: SeoProject | null = null;
    let bestScore = 0;

    for (const project of projects) {
      const projectHost = hostOf(project.gsc_property_url ?? project.domain);
      const score = hostSimilarity(host, projectHost);
      if (score > bestScore) {
        bestScore = score;
        best = project;
      }
    }

    if (!best || bestScore < 60) {
      return { property, project: null, confidence: bestScore, status: "needs-review" };
    }
    return {
      property,
      project: best,
      confidence: bestScore,
      status: bestScore >= 90 ? "matched" : "needs-review",
    };
  });
}

function hostSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 100;
  // One is a subdomain of the other: same registrable domain, different site.
  if (a.endsWith(`.${b}`) || b.endsWith(`.${a}`)) return 75;
  return 0;
}

/** Track a set of queries so they get a ranking history of their own. */
export async function trackKeywords(
  userId: string,
  property: string,
  keywords: string[],
  projectId?: string,
): Promise<number> {
  const unique = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
  if (unique.length === 0) return 0;

  const { error } = await requireSupabase()
    .from("tracked_keywords")
    .upsert(
      unique.map((keyword) => ({
        user_id: userId,
        property,
        keyword,
        project_id: projectId ?? null,
        active: true,
      })),
      { onConflict: "user_id,property,keyword", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Could not track keywords: ${error.message}`);
  return unique.length;
}
