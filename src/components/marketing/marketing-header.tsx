import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Moon, Sun, Menu, X } from "lucide-react";
import { MeridianLogo } from "@/components/ui/meridian-logo";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useAnalytics((s) => s.theme);
  const toggleTheme = useAnalytics((s) => s.toggleTheme);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // A FLOATING pill inset from the top, not a full-width bar — the form on
    // the reference site. It stays a pill at every scroll position; scrolling
    // only raises its opacity and shadow so it separates from content.
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-2 sm:px-4",
          "transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-[var(--ease-out-soft)]",
          scrolled
            ? "bg-surface/85 shadow-md backdrop-blur-xl backdrop-saturate-150"
            : "bg-surface/55 shadow-sm backdrop-blur-md",
          "ring-1 ring-hairline",
        )}
      >
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-2 pl-1.5">
          <MeridianLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-[0.8125rem] font-medium text-muted lg:flex">
          <a href="#product" className="hover:text-fg transition-colors">
            Product
          </a>
          <a href="#pulse" className="hover:text-fg transition-colors">
            Pulse
          </a>
          <a href="#search-console" className="hover:text-fg transition-colors">
            Search Intelligence
          </a>
          <a href="#ai" className="hover:text-fg transition-colors">
            AI Assistant
          </a>
          <a href="#pricing" className="hover:text-fg transition-colors">
            Pricing
          </a>
        </nav>

        {/* Action group */}
        <div className="hidden items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-lg p-2 text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-fg"
          >
            Sign in
          </Link>

          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.8125rem] font-medium text-accent-fg transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            <span>Launch app</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-muted hover:text-fg"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-muted hover:text-fg"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl bg-surface/95 px-6 py-5 shadow-lg ring-1 ring-hairline backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-muted">
            <a href="#product" onClick={() => setMobileMenuOpen(false)} className="hover:text-fg">
              Product
            </a>
            <a href="#pulse" onClick={() => setMobileMenuOpen(false)} className="hover:text-fg">
              Meridian Pulse
            </a>
            <a href="#search-console" onClick={() => setMobileMenuOpen(false)} className="hover:text-fg">
              Search Intelligence
            </a>
            <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="hover:text-fg">
              AI Assistant
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-fg">
              Pricing
            </a>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link to="/login" className="text-center py-2 rounded-lg border border-border text-fg">
                Sign in
              </Link>
              <Link to="/app" className="text-center py-2 rounded-lg bg-accent text-white font-medium">
                Launch app
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
