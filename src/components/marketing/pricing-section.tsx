import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/month",
      desc: "For growing websites and founders needing clear signal over noise.",
      features: [
        "Up to 100K monthly tracked events",
        "3 connected properties",
        "Google Search Console import",
        "Pulse health diagnostics",
        "14-day data retention",
        "Community support",
      ],
      cta: "Start free trial",
      popular: false,
    },
    {
      name: "Growth",
      price: "€149",
      period: "/month",
      desc: "For digital brands, travel operators, and scaling SaaS products.",
      features: [
        "Up to 1M monthly tracked events",
        "10 connected properties",
        "Full GSC query & revenue join",
        "Multi-touch causal attribution",
        "Holt-Winters predictive forecasting",
        "Ask Meridian AI Copilot (Unlimited)",
        "12-month data retention",
        "Priority Slack support",
      ],
      cta: "Start free trial",
      popular: true,
    },
    {
      name: "Scale",
      price: "€390",
      period: "/month",
      desc: "For high-volume media properties, multi-brand portfolios and agencies.",
      features: [
        "Up to 10M monthly tracked events",
        "Unlimited properties",
        "Model Context Protocol (MCP) server",
        "Autonomous Anomaly Radar & Webhooks",
        "Custom domain share widgets",
        "Bot Sentinel active filtering",
        "Multi-year data warehouse retention",
        "Dedicated analytics architect",
      ],
      cta: "Contact sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
      <div className="text-center mb-14">
        <span className="kicker block text-accent mb-2">Transparent Pricing</span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fg text-balance">
          Simple, predictable investment.
        </h2>
        <p className="mt-2 text-sm text-muted max-w-lg mx-auto">
          Start with a 14-day free trial on any tier. No credit card required to connect Search Console.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              plan.popular
                ? "border-accent bg-surface shadow-lg ring-1 ring-accent"
                : "border-border bg-surface/60"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wider">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-base font-semibold text-fg">{plan.name}</h3>
              <p className="caption mt-1 min-h-[32px]">{plan.desc}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="stat-value text-3xl font-bold text-fg">{plan.price}</span>
                <span className="caption">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-muted">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="size-3.5 text-positive shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              <Link
                to="/app"
                className={`w-full text-center block rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  plan.popular
                    ? "bg-accent text-white shadow-xs hover:bg-accent/90"
                    : "border border-border bg-surface text-fg hover:bg-elevated"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
