import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether Supabase is configured. The app must still render without it — the
 * marketing site, the sandbox and the design system have no backend dependency,
 * and a missing key should degrade those to mock data, not white-screen them.
 */
export const supabaseEnabled = Boolean(url && anonKey);

/**
 * Browser Supabase client for the AnotherSEOGuru project.
 *
 * Every read is RLS-gated: `gsc_search_analytics`, `gsc_sync_runs`,
 * `seo_projects` and `search_intelligence_opportunities` only return rows whose
 * owning `seo_projects.user_id` matches `auth.uid()`. That means a signed-out
 * visitor gets empty arrays rather than an error — callers should treat empty
 * and unauthenticated as the same "nothing to show" state.
 *
 * Null when unconfigured; use `requireSupabase()` where a client is mandatory.
 */
export const supabase: SupabaseClient<Database> | null = supabaseEnabled
  ? createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: { "x-client-info": "meridian-analytics" },
      },
    })
  : null;

/** The client, or a clear error instead of a downstream `null` dereference. */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env",
    );
  }
  return supabase;
}

/** Base URL for invoking the project's 143 deployed edge functions. */
export const functionsUrl = url ? `${url}/functions/v1` : null;
