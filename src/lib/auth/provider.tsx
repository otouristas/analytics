import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseAuthProvider } from "@/lib/supabase/auth";

/**
 * App-wide client providers, mounted once near the root (`src/routes/__root.tsx`):
 *
 *   <AuthProvider><Outlet /></AuthProvider>
 *
 * Two things live here:
 *
 * - The Supabase session. Meridian authenticates against the AnotherSEOGuru
 *   Supabase project because that is where the data lives, and every table it
 *   reads is RLS-scoped to `auth.uid()` — without a session the queries succeed
 *   but return nothing.
 * - The React Query cache, which the Supabase hooks read through. Search
 *   Console data is backfilled by a batch sync rather than written live, so it
 *   is stale-by-nature and worth caching hard.
 *
 * The client is created in state, not at module scope: on the server a
 * module-level cache would be shared across every request.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
