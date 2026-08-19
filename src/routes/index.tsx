import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { SocialProof } from "@/components/marketing/social-proof";
import { FeatureSection } from "@/components/marketing/feature-section";
import { IntegrationsGrid } from "@/components/marketing/integrations-grid";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({ component: MarketingPage });

function MarketingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/20 selection:text-accent font-sans antialiased">
      {/* 1. Global Sticky Marketing Header */}
      <MarketingHeader />

      {/* 2. Cinematic Hero Section */}
      <main>
        <HeroSection />

        {/* 3. Social Proof & Metric Badges */}
        <SocialProof />

        {/* 4. Product Story & Split Feature Sections */}
        <FeatureSection />

        {/* 5. Connected Integrations Grid */}
        <IntegrationsGrid />

        {/* 6. Pricing Tiers */}
        <PricingSection />

        {/* 7. Final Call to Action */}
        <section className="relative overflow-hidden py-24 border-t border-border bg-gradient-to-b from-surface/40 to-surface">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-fg text-balance">
              Your data already knows what happened. Meridian tells you what it means.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted">
              Connect Google Search Console and begin understanding root causes in under two minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-accent/90 transition-all duration-150 active:scale-95"
              >
                <span>Start free trial</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-fg shadow-xs hover:bg-elevated transition-colors"
              >
                <span>Explore demo workspace</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Global Multi-Column Footer */}
      <MarketingFooter />
    </div>
  );
}
