/**
 * Typed surface of the AnotherSEOGuru Supabase schema that Meridian reads.
 *
 * The project has ~160 tables; generating all of them produces 7k lines of
 * types for tables this app never touches. These are the ones Meridian queries,
 * hand-kept so a schema drift shows up as a type error in the query layer
 * rather than as `any` flowing into a chart.
 *
 * To regenerate the full set instead:
 *   npx supabase gen types typescript --project-id siwzszmukfbzicjjkxro
 */

/** A Search Console property the user has connected. */
export interface GscProperty {
  id: string;
  user_id: string;
  project_id: string | null;
  seo_project_id: string | null;
  site_url: string;
  permission_level: string | null;
  verified: boolean | null;
  selected: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * Which dimensions a `gsc_search_analytics` row is broken down by. Rows are
 * NOT interchangeable across sets — summing `date_query_page` and
 * `daily_total` double-counts the same clicks. Always filter on one set.
 */
export type GscDimensionSet =
  | "daily_total"
  | "date_query_page"
  | "date_query_page_country_device"
  | "hour_query_page";

/** One Search Console metric row at a given dimension breakdown. */
export interface GscSearchAnalyticsRow {
  id: string;
  seo_project_id: string;
  site_url: string;
  dimension_set: GscDimensionSet;
  data_state: string | null;
  date: string;
  hour: string | null;
  query: string | null;
  page: string | null;
  country: string | null;
  device: string | null;
  search_type: string | null;
  clicks: number;
  impressions: number;
  /** Google's own ratio, 0–1 — not a percentage. */
  ctr: number;
  /** Average position; LOWER is better, so deltas invert. */
  position: number;
  imported_at: string;
}

/** A Search Console ingest run — powers "last sync" and sync health. */
export interface GscSyncRun {
  id: string;
  seo_project_id: string;
  site_url: string;
  mode: string | null;
  state: string | null;
  start_date: string | null;
  end_date: string | null;
  rows_fetched: number | null;
  rows_written: number | null;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

/** A tracked site. Meridian's "property". */
export interface SeoProject {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  gsc_property_url: string | null;
  description: string | null;
  is_active: boolean | null;
  country_code: string | null;
  locale: string | null;
  money_page_pattern: string | null;
  created_at: string;
  updated_at: string;
}

/** The worker emits P0 (act now) through P3, not adjectives. */
export type OpportunityPriority = "P0" | "P1" | "P2" | "P3";

/** A prioritised action surfaced by the search-intelligence worker. */
export interface SearchIntelligenceOpportunity {
  id: string;
  user_id: string;
  project_id: string;
  opportunity_type: string;
  title: string;
  keyword: string | null;
  target_url: string | null;
  competitor_domain: string | null;
  score: number | null;
  priority: OpportunityPriority | string | null;
  status: string | null;
  evidence: Record<string, unknown> | null;
  recommendation: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  job_title: string | null;
  timezone: string | null;
  onboarding_completed: boolean | null;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      gsc_properties: { Row: GscProperty; Insert: Partial<GscProperty>; Update: Partial<GscProperty> };
      gsc_search_analytics: {
        Row: GscSearchAnalyticsRow;
        Insert: Partial<GscSearchAnalyticsRow>;
        Update: Partial<GscSearchAnalyticsRow>;
      };
      gsc_sync_runs: { Row: GscSyncRun; Insert: Partial<GscSyncRun>; Update: Partial<GscSyncRun> };
      seo_projects: { Row: SeoProject; Insert: Partial<SeoProject>; Update: Partial<SeoProject> };
      search_intelligence_opportunities: {
        Row: SearchIntelligenceOpportunity;
        Insert: Partial<SearchIntelligenceOpportunity>;
        Update: Partial<SearchIntelligenceOpportunity>;
      };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
