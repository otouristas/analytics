import { authEnabled } from "./client";
import { useSupabaseAuth } from "@/lib/supabase/auth";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** True when this is the sandbox/dev fallback (auth not configured). */
  isDevFallback: boolean;
};

/**
 * Stable fallback user, used ONLY when auth is explicitly disabled
 * (`VITE_AUTH_ENABLED=false`). Useful for design work on the product shell
 * without a live session — but note that Supabase returns no rows for it, so
 * boards fall back to their mock data in that mode.
 */
export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Dev User",
  primaryEmail: "dev@example.com",
  profileImageUrl: null,
  isDevFallback: true,
};

/** `useCurrentUserState()` result: the user plus the session-loading flag. */
export type CurrentUserState = {
  /** The user — `null` BOTH while the session loads and when signed out. */
  user: AppUser | null;
  /** True while the session is still resolving — don't treat `user: null` as signed out yet. */
  isPending: boolean;
};

/**
 * Current user + loading state, backed by Supabase Auth.
 *
 *   - Auth enabled (default) -> the real signed-in Supabase user; `user` is
 *                            `null` while the session resolves
 *                            (`isPending: true`) and when signed out
 *                            (`isPending: false`).
 *   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
 *
 * Protect a route by waiting out `isPending` before acting on `user` —
 * redirecting on `user: null` alone bounces signed-in visitors to sign-in on
 * every hard reload:
 *
 *   import { RedirectToSignIn } from "@/lib/auth/gates";
 *   const { user, isPending } = useCurrentUserState();
 *   if (isPending) return null;              // still resolving — don't redirect yet
 *   if (!user) return <RedirectToSignIn />;  // definitely signed out
 *
 * The Supabase hook is called unconditionally so hook order stays stable; the
 * `authEnabled` branch only chooses which result to return.
 */
export function useCurrentUserState(): CurrentUserState {
  const { user, isPending } = useSupabaseAuth();

  if (!authEnabled) return { user: DEV_USER, isPending: false };

  return {
    user: user
      ? {
          id: user.id,
          displayName:
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          primaryEmail: user.email ?? null,
          profileImageUrl:
            (user.user_metadata?.avatar_url as string | undefined) ??
            (user.user_metadata?.picture as string | undefined) ??
            null,
          isDevFallback: false,
        }
      : null,
    isPending,
  };
}

/**
 * Convenience view of `useCurrentUserState().user` for display (e.g.
 * `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
 * for redirects/guards use `useCurrentUserState()` and check `isPending`.
 */
export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
