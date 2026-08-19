import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, CheckCircle2, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Bloom } from "@/components/ui/primitives";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* The hero light: the brand gradient rendered as a blue-to-green radial,
          breathing on an 8s cycle. It sits above the page's blueprint grid. */}
      <Bloom className="left-1/2 top-[-6rem] h-[32rem] w-[64rem] -translate-x-1/2" />
      <div className="pointer-events-none absolute inset-0 meridian-cross opacity-[0.03]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Eyebrow badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="flex size-2 rounded-full bg-brand" />
          <span className="text-fg font-semibold">Meridian Intelligence 2.0</span>
          <span className="text-subtle">·</span>
          <span>Analytics that explains what matters</span>
        </div>

        {/* Hero headline */}
        <h1 className="rise-in relative text-balance font-display text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-fg sm:text-6xl">
          Your analytics should tell you <span className="text-accent">what to do next</span>.
        </h1>

        {/* Supporting description */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted leading-relaxed font-normal text-pretty">
          Meridian connects traffic, Search Console, visitor intent, conversions and business outcomes into one intelligent workspace.
        </p>

        {/* CTA group */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-accent/90 transition-all duration-150 active:scale-95"
          >
            <span>Start free</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-fg shadow-xs hover:bg-elevated transition-colors"
          >
            <span>Explore live workspace</span>
          </Link>
        </div>

        {/* Trust subtext */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-subtle">
          <ShieldCheck className="size-3.5 text-positive" />
          <span>Connect Search Console in minutes. No credit card required.</span>
        </div>

        {/* Floating Product Hero Visual */}
        <div className="relative mt-14 sm:mt-20">
          {/* Master floating window. `frame-halo` is the product-frame glow the
              design system reserves for mockups — a coloured halo plus a real
              drop shadow, rather than a blurred gradient rectangle. */}
          <div className="frame-halo relative overflow-hidden rounded-2xl border border-hairline bg-surface p-3 text-left sm:p-5">
            {/* Top window bar */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-border-strong" />
                  <span className="size-2.5 rounded-full bg-border-strong" />
                  <span className="size-2.5 rounded-full bg-border-strong" />
                </div>
                <span className="ml-2 font-mono text-xs text-muted">discovercyclades.gr / overview</span>
              </div>
              <StatusBadge status="healthy" label="Pulse: Healthy" size="sm" />
            </div>

            {/* Metric KPI cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-elevated/60 p-3">
                <span className="caption block">Sessions</span>
                <span className="stat-value text-lg font-bold text-fg">128,429</span>
                <span className="caption delta-positive font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" /> +14.3%
                </span>
              </div>
              <div className="rounded-xl border border-border bg-elevated/60 p-3">
                <span className="caption block">Qualified Sessions</span>
                <span className="stat-value text-lg font-bold text-fg">32,841</span>
                <span className="caption delta-positive font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" /> +21.8%
                </span>
              </div>
              <div className="rounded-xl border border-border bg-elevated/60 p-3">
                <span className="caption block">Organic Revenue</span>
                <span className="stat-value text-lg font-bold text-fg">€84,920</span>
                <span className="caption delta-positive font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" /> +9.7%
                </span>
              </div>
              <div className="rounded-xl border border-border bg-elevated/60 p-3">
                <span className="caption block">Conversion Rate</span>
                <span className="stat-value text-lg font-bold text-fg">4.82%</span>
                <span className="caption delta-positive font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" /> +0.41%
                </span>
              </div>
            </div>

            {/* Split chart & AI Brief */}
            <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left chart mockup */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-elevated/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-fg">Business Intent Velocity</span>
                  <span className="caption font-mono">Last 28 Days</span>
                </div>
                {/* SVG mock line wave */}
                <div className="h-32 w-full flex items-end">
                  <svg viewBox="0 0 400 100" className="w-full h-full text-accent" fill="none">
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,10 L400,100 L0,100 Z"
                      fill="currentColor"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
              </div>

              {/* Right AI brief panel */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-accent text-xs font-semibold mb-1">
                    <Sparkles className="size-3.5" />
                    <span>What changed?</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Organic qualified sessions increased <strong>+18.7%</strong> this week.
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-muted">
                    <li className="flex items-center gap-1">
                      <span className="size-1 rounded-full bg-positive" /> Search visibility +9.2%
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="size-1 rounded-full bg-positive" /> Branded traffic +4.8%
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="size-1 rounded-full bg-positive" /> Product-page conversion +3.1%
                    </li>
                  </ul>
                </div>

                <Link
                  to="/app"
                  className="mt-3 inline-flex items-center justify-between rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                  <span>Investigate cause</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
