import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MeridianLogo } from "@/components/ui/meridian-logo";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Globe,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: OnboardingWizard });

export function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProps, setSelectedProps] = useState<string[]>(["discovercyclades.gr"]);

  const properties = [
    { domain: "discovercyclades.gr", type: "Domain", status: "Verified", data: "16 months" },
    { domain: "anotherseoguru.com", type: "Domain", status: "Verified", data: "16 months" },
    { domain: "hotelssifnos.com", type: "URL prefix", status: "Verified", data: "14 months" },
  ];

  const filteredProps = properties.filter((p) =>
    p.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleProperty = (domain: string) => {
    setSelectedProps((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
    );
  };

  return (
    <main className="min-h-dvh bg-bg text-fg px-4 py-8 flex flex-col justify-between">
      {/* Header */}
      <div className="mx-auto w-full max-w-2xl flex items-center justify-between pb-6 border-b border-border">
        <Link to="/">
          <MeridianLogo size="md" />
        </Link>
        <span className="caption font-mono">Step {step} of 5</span>
      </div>

      {/* Main Form container */}
      <div className="mx-auto w-full max-w-2xl py-8">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 text-xs">
          {[
            { s: 1, label: "Account" },
            { s: 2, label: "Search Console" },
            { s: 3, label: "Properties" },
            { s: 4, label: "Match" },
            { s: 5, label: "Ready" },
          ].map((item) => (
            <div
              key={item.s}
              className={cn(
                "flex items-center gap-1.5 font-medium transition-colors",
                step === item.s ? "text-accent" : step > item.s ? "text-positive" : "text-subtle",
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full flex items-center justify-center text-[10px]",
                  step === item.s
                    ? "bg-accent text-white"
                    : step > item.s
                      ? "bg-positive-soft text-positive"
                      : "bg-subtle-surface text-subtle",
                )}
              >
                {step > item.s ? <Check className="size-3" /> : item.s}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Account Setup ── */}
        {step === 1 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-fg">Let's set up your workspace</h2>
              <p className="mt-1 text-xs text-muted">
                Create a high-resolution workspace for your properties and growth team.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="caption block text-muted font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  defaultValue="Giorgio Demetriou"
                  className="w-full rounded-lg border border-border bg-elevated/50 px-3 py-2 text-xs text-fg outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="caption block text-muted font-medium mb-1">Workspace Name</label>
                <input
                  type="text"
                  defaultValue="Meridian Growth"
                  className="w-full rounded-lg border border-border bg-elevated/50 px-3 py-2 text-xs text-fg outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-semibold text-white hover:bg-accent/90 transition-all"
            >
              <span>Continue to Search Console</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Connect Google Search Console ── */}
        {step === 2 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Search className="size-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-fg">Connect Google Search Console</h2>
              <p className="mx-auto mt-1.5 max-w-md text-xs text-muted leading-relaxed">
                Import verified Search Console properties and immediately correlate search queries, positions, and CTR with downstream conversions and revenue.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-elevated/50 border border-border text-xs text-muted text-left space-y-2">
              <div className="flex items-center gap-2 text-fg font-medium">
                <ShieldCheck className="size-4 text-positive" />
                <span>Read-only Search Console access</span>
              </div>
              <p className="text-[11px]">
                Meridian never requests write or delete permissions. Your historical Search Console data is isolated per-tenant.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent py-3 text-xs font-semibold text-white shadow-md hover:bg-accent/90 transition-all"
            >
              <span>Connect Search Console (OAuth)</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── STEP 3: Choose properties to import ── */}
        {step === 3 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-fg">Choose properties to import</h2>
                <p className="mt-1 text-xs text-muted">Found 3 verified Google Search Console properties.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProps(properties.map((p) => p.domain))}
                className="caption text-accent hover:underline"
              >
                Select all
              </button>
            </div>

            {/* Property filter search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified domains..."
                className="w-full rounded-lg border border-border bg-elevated/50 pl-8 pr-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
              />
            </div>

            {/* Property selection list */}
            <div className="space-y-2">
              {filteredProps.map((p) => {
                const selected = selectedProps.includes(p.domain);
                return (
                  <div
                    key={p.domain}
                    onClick={() => toggleProperty(p.domain)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      selected
                        ? "border-accent bg-accent-soft/30"
                        : "border-border bg-elevated/40 hover:border-border-strong",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="size-4 rounded border-border accent-accent"
                      />
                      <div>
                        <span className="font-mono text-xs font-semibold text-fg">{p.domain}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <span>{p.type}</span>
                          <span>·</span>
                          <span className="text-positive font-medium">{p.status}</span>
                        </div>
                      </div>
                    </div>
                    <span className="caption font-mono">{p.data}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={selectedProps.length === 0}
              onClick={() => setStep(4)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 disabled:opacity-40 transition-all"
            >
              <span>Import {selectedProps.length} {selectedProps.length === 1 ? "property" : "properties"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── STEP 4: Property Matching ── */}
        {step === 4 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-fg">Match your properties</h2>
              <p className="mt-1 text-xs text-muted">
                Meridian auto-mapped your tracked website to Search Console domain data.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-elevated/50 p-3.5 flex items-center justify-between">
                <div>
                  <span className="caption block uppercase">Meridian Property</span>
                  <span className="text-xs font-semibold text-fg">Discover Cyclades</span>
                </div>
                <span className="text-xs text-muted">↔</span>
                <div>
                  <span className="caption block uppercase">GSC Domain</span>
                  <span className="text-xs font-mono text-accent">sc-domain:discovercyclades.gr</span>
                </div>
                <StatusBadge status="healthy" label="98% Match" size="sm" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 transition-all"
            >
              <span>Confirm matches & initialize</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── STEP 5: Workspace Ready ── */}
        {step === 5 && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-positive-soft text-positive">
              <CheckCircle2 className="size-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-fg">Your workspace is ready.</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted">
                {selectedProps.length} properties connected. Google Search Console syncing in the background.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-elevated/50 p-3 border border-border text-xs">
              <div>
                <span className="caption block">Properties</span>
                <span className="font-bold text-fg">{selectedProps.length}</span>
              </div>
              <div>
                <span className="caption block">Search Console</span>
                <span className="font-bold text-positive">Syncing</span>
              </div>
              <div>
                <span className="caption block">Analytics</span>
                <span className="font-bold text-positive">Active</span>
              </div>
            </div>

            <Link
              to="/app"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-xs font-semibold text-white shadow-md hover:bg-accent/90 transition-all"
            >
              <span>Open Meridian</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mx-auto text-center text-xs text-subtle">
        <span>© {new Date().getFullYear()} Meridian Analytics · Privacy & Security</span>
      </div>
    </main>
  );
}
