import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-3xl italic tracking-tight">
          Meridian
        </Link>
        <p className="mt-2 text-sm text-muted">Analytics workspace. Sign in to continue.</p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              >
                Continue with {provider.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link to="/" className="mt-8 inline-block text-sm text-subtle hover:text-fg">
          Back to the map
        </Link>
      </div>
    </main>
  );
}
