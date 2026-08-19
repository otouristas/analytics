import { ArrowRight, Bot, Compass, GitBranch, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/ui/status-badge";

export function FeatureSection() {
  return (
    <div className="space-y-24 sm:space-y-32 py-16 sm:py-24">
      {/* ── 1. The Problem: Dashboards show numbers. Meridian explains the business. ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="kicker block text-accent mb-2">The Difference</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fg text-balance">
            Dashboards show numbers. Meridian explains the business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <span className="caption block uppercase font-medium text-subtle mb-1">Traditional Analytics</span>
              <p className="text-sm font-semibold text-danger">"Traffic is down 18%."</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="caption block uppercase font-medium text-accent mb-1">Meridian Insight</span>
              <p className="text-xs text-muted leading-relaxed">
                Qualified organic traffic decreased 18%, primarily due to mobile traffic to three high-value landing pages.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <span className="caption block uppercase font-medium text-subtle mb-1">Traditional Analytics</span>
              <p className="text-sm font-semibold text-danger">"Conversions dropped."</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="caption block uppercase font-medium text-accent mb-1">Meridian Insight</span>
              <p className="text-xs text-muted leading-relaxed">
                Conversion loss is concentrated in Safari sessions after the latest release due to a 1.6s LCP degradation.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <span className="caption block uppercase font-medium text-subtle mb-1">Traditional Analytics</span>
              <p className="text-sm font-semibold text-positive">"Search clicks increased."</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="caption block uppercase font-medium text-accent mb-1">Meridian Insight</span>
              <p className="text-xs text-muted leading-relaxed">
                Search clicks increased, but traffic quality declined — zero commercial intent from non-target keywords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Meridian Pulse: Know the health of your business in seconds. ── */}
      <section id="pulse" className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="kicker block text-accent">Real-time Diagnostic</span>
            <h2 className="text-3xl font-bold tracking-tight text-fg text-balance">
              Know the health of your business in seconds.
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Meridian Pulse constantly scans 7 vital operational layers: traffic quality, search visibility, conversion health, revenue pacing, and client-side performance regressions.
            </p>
            <div className="pt-2">
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>View live Pulse radar</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Pulse visual cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Traffic</span>
              <StatusBadge status="healthy" label="Healthy" size="sm" className="mt-1" />
            </div>
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Qualified Sessions</span>
              <StatusBadge status="healthy" label="Healthy" size="sm" className="mt-1" />
            </div>
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Search Visibility</span>
              <StatusBadge status="watch" label="Watch" size="sm" className="mt-1" />
            </div>
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Conversions</span>
              <StatusBadge status="healthy" label="Healthy" size="sm" className="mt-1" />
            </div>
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Revenue</span>
              <StatusBadge status="healthy" label="Healthy" size="sm" className="mt-1" />
            </div>
            <div className="rounded-lg bg-elevated/70 p-3 border border-border/50">
              <span className="caption block">Tracking Integrity</span>
              <StatusBadge status="healthy" label="Healthy" size="sm" className="mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Search Console Connected to Real Business Outcomes ── */}
      <section id="search-console" className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="kicker block text-accent mb-2">Search Intelligence</span>
          <h2 className="text-3xl font-bold tracking-tight text-fg text-balance">
            Search Console, connected to real business outcomes.
          </h2>
          <p className="mt-2 text-sm text-muted max-w-xl mx-auto">
            Stop guessing if rank #3 drove actual revenue. Meridian joins GSC query aggregates with downstream conversions.
          </p>
        </div>

        {/* Rich GSC Table Mockup */}
        <div className="rounded-2xl border border-border bg-surface shadow-lg overflow-hidden">
          <div className="overflow-x-auto thin-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
                  <th>Position</th>
                  <th>Qualified Sessions</th>
                  <th>Conversions</th>
                  <th>Revenue</th>
                  <th>Opportunity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono text-xs text-accent">/best-hotels-santorini</td>
                  <td>12.4K</td>
                  <td>318K</td>
                  <td>6.2</td>
                  <td className="font-semibold text-fg">4.1K</td>
                  <td>208</td>
                  <td className="font-semibold text-fg">€14,200</td>
                  <td><span className="rounded bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">High</span></td>
                </tr>
                <tr>
                  <td className="font-mono text-xs text-accent">/guide-to-paros</td>
                  <td>8.8K</td>
                  <td>201K</td>
                  <td>9.4</td>
                  <td className="font-semibold text-fg">3.7K</td>
                  <td>151</td>
                  <td className="font-semibold text-fg">€9,800</td>
                  <td><span className="rounded bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">High</span></td>
                </tr>
                <tr>
                  <td className="font-mono text-xs text-accent">/sifnos-ferry-tickets</td>
                  <td>4.2K</td>
                  <td>94K</td>
                  <td>4.1</td>
                  <td className="font-semibold text-fg">1.8K</td>
                  <td>94</td>
                  <td className="font-semibold text-fg">€6,100</td>
                  <td><span className="rounded bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">Medium</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Ask Meridian AI Copilot ── */}
      <section id="ai" className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-surface via-surface to-elevated p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 text-accent font-semibold text-xs mb-3">
            <Sparkles className="size-4" />
            <span>AI Analytical Workspace</span>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3.5 mb-6 text-xs font-mono text-muted flex items-center justify-between">
            <span className="text-fg">"Why did organic conversions decrease this week?"</span>
            <span className="caption">Analysis complete (0.8s)</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-fg">Organic conversions decreased 12.4%.</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                78% of the decline is concentrated in mobile users landing on three commercial guide pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-subtle-surface p-3 text-xs">
                <span className="caption block uppercase font-semibold">Evidence</span>
                <ul className="mt-1 space-y-0.5 text-muted">
                  <li>· Organic traffic: Stable (±0.8%)</li>
                  <li>· Search rank: Stable (#4.2 avg)</li>
                  <li>· Mobile conversion: -19%</li>
                  <li>· LCP: Worsened from 2.1s to 3.7s</li>
                </ul>
              </div>

              <div className="rounded-lg bg-subtle-surface p-3 text-xs">
                <span className="caption block uppercase font-semibold">Prescription</span>
                <p className="mt-1 text-muted leading-relaxed">
                  Investigate recent script deployments affecting mobile Largest Contentful Paint on hotel directory templates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
