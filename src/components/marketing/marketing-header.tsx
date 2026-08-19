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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled
          ? "border-b border-border/80 bg-surface/80 backdrop-blur-md py-3 shadow-xs"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <MeridianLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex text-xs font-medium text-muted">
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
        <div className="hidden items-center gap-3 md:flex">
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
            className="text-xs font-medium text-muted hover:text-fg transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>

          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-accent/90 transition-all duration-150 active:scale-95"
          >
            <span>Launch app</span>
            <ArrowRight className="size-3" />
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
        <div className="border-b border-border bg-surface/95 backdrop-blur-xl px-6 py-5 md:hidden animate-in slide-in-from-top-4 duration-200">
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
