import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { SocialProof } from "@/components/marketing/social-proof";
import { FeatureSection } from "@/components/marketing/feature-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { SignalChain } from "@/components/marketing/signal-chain";
import { ValueProof } from "@/components/marketing/value-proof";
import { UseCases } from "@/components/marketing/use-cases";
import { IntegrationsGrid } from "@/components/marketing/integrations-grid";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Bloom } from "@/components/ui/primitives";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: MarketingPage });

function MarketingPage() {
  return (
    // The 64px blueprint grid runs behind the whole marketing page — the
    // quietest of the brand's three grounds, and the one that makes the
    // editorial sections read as drawn rather than stacked.
    <div className="blueprint-grid min-h-screen bg-bg font-sans text-fg antialiased">
      {/* 1. Global Sticky Marketing Header */}
      <MarketingHeader />

      {/* 2. Cinematic Hero Section */}
      <main>
        <HeroSection />

        {/* 3. Social Proof & Metric Badges */}
        <SocialProof />

        {/* 4. The argument: a number is not a finding */}
        <ProblemSection />

        {/* 5. How the signals connect, end to end */}
        <SignalChain />

        {/* 6. Product Story & Split Feature Sections */}
        <FeatureSection />

        {/* 7. Traffic vs. value, argued with two real pages */}
        <ValueProof />

        {/* 8. Who it's for */}
        <UseCases />

        {/* 5. Connected Integrations Grid */}
        <IntegrationsGrid />

        {/* 6. Pricing Tiers */}
        <PricingSection />

        {/* 7. Final Call to Action */}
        <section className="relative overflow-hidden border-t border-hairline py-24">
          <Bloom className="left-1/2 top-1/2 h-[24rem] w-[44rem] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-balance font-display text-3xl font-medium leading-[1.06] tracking-[-0.03em] text-fg sm:text-5xl">
              Your data already knows what happened. Meridian tells you what it means.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-muted">
              Connect Google Search Console and begin understanding root causes in under two minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 active:scale-95"
              >
                <span>Start free trial</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-raised px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-brand/40"
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
