import { Link } from "@tanstack/react-router";
import { MeridianLogo } from "@/components/ui/meridian-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface/50 text-xs text-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo & Pitch */}
          <div className="col-span-2 space-y-3">
            <MeridianLogo size="md" />
            <p className="max-w-xs text-muted leading-relaxed font-normal text-xs">
              Know what changed. Know why. Know what to do next. Analytics intelligence for modern growth teams.
            </p>
            <p className="text-[11px] text-subtle pt-2">
              © {new Date().getFullYear()} Meridian Analytics Inc. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <p className="font-semibold text-fg text-xs tracking-tight">Product</p>
            <ul className="space-y-2">
              <li><Link to="/app" className="hover:text-fg transition-colors">Overview</Link></li>
              <li><Link to="/app" className="hover:text-fg transition-colors">Search Intelligence</Link></li>
              <li><Link to="/app" className="hover:text-fg transition-colors">Ask Meridian AI</Link></li>
              <li><Link to="/app" className="hover:text-fg transition-colors">Customer Journeys</Link></li>
              <li><Link to="/app" className="hover:text-fg transition-colors">Multi-Touch Attribution</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-2.5">
            <p className="font-semibold text-fg text-xs tracking-tight">Solutions</p>
            <ul className="space-y-2">
              <li><span className="hover:text-fg cursor-pointer">SEO Teams</span></li>
              <li><span className="hover:text-fg cursor-pointer">Growth & CRO</span></li>
              <li><span className="hover:text-fg cursor-pointer">Ecommerce</span></li>
              <li><span className="hover:text-fg cursor-pointer">Agencies</span></li>
              <li><span className="hover:text-fg cursor-pointer">Travel & Hospitality</span></li>
            </ul>
          </div>

          {/* Resources & Trust */}
          <div className="space-y-2.5">
            <p className="font-semibold text-fg text-xs tracking-tight">Trust & Docs</p>
            <ul className="space-y-2">
              <li><span className="hover:text-fg cursor-pointer">Documentation</span></li>
              <li><span className="hover:text-fg cursor-pointer">API Reference</span></li>
              <li><span className="hover:text-fg cursor-pointer">Security & GDPR</span></li>
              <li><span className="hover:text-fg cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-fg cursor-pointer">Changelog</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
