export type IntegrationId =
  | "stripe"
  | "shopify"
  | "polar"
  | "lemonsqueezy"
  | "meta_ads"
  | "google_ads"
  | "gsc"
  | "wordpress"
  | "webflow"
  | "gtm";

export type IntegrationStatus = "disconnected" | "pending" | "connected" | "error";

export type IntegrationConnection = {
  id: IntegrationId;
  name: string;
  category: "payment" | "advertising" | "cms" | "seo";
  status: IntegrationStatus;
  createdAt: number;
  lastEventAt?: number;
  lastError?: string;
  webhookUrl: string;
  docsUrl?: string;
};

const DEFAULT_INTEGRATIONS: Record<IntegrationId, IntegrationConnection> = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    category: "payment",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/webhooks/stripe",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    category: "payment",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/webhooks/shopify",
  },
  polar: {
    id: "polar",
    name: "Polar.sh",
    category: "payment",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/webhooks/polar",
  },
  lemonsqueezy: {
    id: "lemonsqueezy",
    name: "Lemon Squeezy",
    category: "payment",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/webhooks/lemonsqueezy",
  },
  meta_ads: {
    id: "meta_ads",
    name: "Meta Ads",
    category: "advertising",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/integrations/meta",
  },
  google_ads: {
    id: "google_ads",
    name: "Google Ads",
    category: "advertising",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/integrations/google-ads",
  },
  gsc: {
    id: "gsc",
    name: "Google Search Console",
    category: "seo",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/integrations/gsc",
  },
  wordpress: {
    id: "wordpress",
    name: "WordPress Plugin",
    category: "cms",
    status: "connected",
    createdAt: Date.now(),
    webhookUrl: "/public/plugins/meridian-analytics/",
  },
  webflow: {
    id: "webflow",
    name: "Webflow",
    category: "cms",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/collect",
  },
  gtm: {
    id: "gtm",
    name: "Google Tag Manager",
    category: "cms",
    status: "disconnected",
    createdAt: Date.now(),
    webhookUrl: "/api/collect",
  },
};

const storeConnections = { ...DEFAULT_INTEGRATIONS };

export function getIntegrationsList(): IntegrationConnection[] {
  return Object.values(storeConnections);
}

export function getIntegration(id: IntegrationId): IntegrationConnection | undefined {
  return storeConnections[id];
}

export function updateIntegrationStatus(
  id: IntegrationId,
  status: IntegrationStatus,
  lastError?: string,
): void {
  if (storeConnections[id]) {
    storeConnections[id] = {
      ...storeConnections[id],
      status,
      lastEventAt: Date.now(),
      lastError,
    };
  }
}
