import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "./client";

export interface SupabaseAuthState {
  session: Session | null;
  user: User | null;
  /** True until the initial session lookup resolves. */
  isPending: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthState>({
  session: null,
  user: null,
  isPending: true,
});

/**
 * Supabase session, held once for the whole app.
 *
 * Every RLS policy in this project keys off `auth.uid()`, so the session is not
 * just a login state — it is what makes the data layer return rows at all. It
 * lives in context rather than in each hook so a page with a dozen queries does
 * not fire a dozen `getSession()` calls.
 *
 * `onAuthStateChange` fires on sign-in, sign-out, token refresh and on the
 * OAuth redirect back from Google, which is why nothing needs to poll.
 */
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // With no Supabase configured there is no session to wait for, so resolve
  // immediately — otherwise every gate in the app would hang on `isPending`.
  const [isPending, setIsPending] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setIsPending(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setIsPending(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SupabaseAuthState>(
    () => ({ session, user: session?.user ?? null, isPending }),
    [session, isPending],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthState {
  return useContext(SupabaseAuthContext);
}

/** The signed-in user's id, or null. This is the value every RLS policy compares against. */
export function useSupabaseUserId(): string | null {
  return useSupabaseAuth().user?.id ?? null;
}

export interface AuthResult {
  error: string | null;
}

function describe(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

/**
 * Google OAuth. Requests the read-only Search Console scope alongside sign-in
 * so a user who connects Google once can also import their GSC properties —
 * `access_type: offline` + `prompt: consent` is what makes Google return the
 * refresh token the `gsc-query` edge function needs to keep syncing later.
 */
export async function signInWithGoogle(redirectTo = "/app"): Promise<AuthResult> {
  if (!supabase) return { error: "Supabase is not configured." };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${redirectTo}`,
      scopes: "https://www.googleapis.com/auth/webmasters.readonly",
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  return { error: error ? describe(error) : null };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: "Supabase is not configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? describe(error) : null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResult> {
  if (!supabase) return { error: "Supabase is not configured." };
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: `${window.location.origin}/app`,
    },
  });
  return { error: error ? describe(error) : null };
}

export async function signOutSupabase(): Promise<void> {
  await supabase?.auth.signOut();
}

/** Hook form of sign-out that also returns the in-flight state for button UI. */
export function useSignOut() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async () => {
    setPending(true);
    try {
      await signOutSupabase();
    } finally {
      setPending(false);
    }
  }, []);
  return { signOut: run, pending };
}
