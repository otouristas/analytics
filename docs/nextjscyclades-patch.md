# Next.js (Discover Cyclades) Event Forwarding Integration

This document outlines the exact patch for `otouristas/nextjscyclades` to forward GA4 events (`phone_click`, `whatsapp_click`, `email_click`, `newsletter_signup`) to Meridian Analytics without duplicating pageviews.

---

## 1. Updated `app/components/MeridianTracker.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    meridian?: {
      track: (kind: string, props?: Record<string, unknown>) => void;
      goal: (name: string, props?: Record<string, unknown>) => void;
    };
  }
}

export function MeridianTracker() {
  const pathname = usePathname();

  // Load tracker once
  useEffect(() => {
    if (document.querySelector("script[data-meridian]")) return;
    const s = document.createElement("script");
    s.src = "https://analytics.discovercyclades.gr/meridian.js";
    s.async = true;
    s.dataset.meridianId = "mk_cyclades";
    s.dataset.host = "https://analytics.discovercyclades.gr";
    s.dataset.meridian = "1";
    s.dataset.cookieless = "1";
    document.head.appendChild(s);
  }, []);

  return null;
}
```

---

## 2. Forwarding Rich Conversions in UI Handlers

When handling phone, WhatsApp, or newsletter conversions in your components:

```tsx
// Example: Direct WhatsApp Button
function onWhatsAppClick(partnerName: string) {
  // GA4
  window.gtag?.("event", "whatsapp_click", { partner: partnerName });

  // Meridian Analytics (Goal + Conversion)
  window.meridian?.goal("whatsapp_click", {
    partner: partnerName,
    path: window.location.pathname,
  });
}

// Example: Newsletter Signup
function onNewsletterSubmit(email: string) {
  // Meridian Analytics Goal
  window.meridian?.goal("newsletter_signup", {
    path: window.location.pathname,
  });
}
```
