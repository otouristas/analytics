export const DESTINATIONS = [
  "santorini",
  "mykonos",
  "paros",
  "naxos",
  "milos",
  "ios",
  "sifnos",
  "folegandros",
  "amorgos",
  "serifos",
  "tinos",
  "syros",
  "andros",
  "antiparos",
  "kea",
  "kythnos",
  "kimolos",
  "koufonisia",
  "anafi",
  "sikinos",
  "donousa",
  "iraklia",
  "schinoussa",
  "thirasia",
] as const;

export type DestinationId = (typeof DESTINATIONS)[number];

const SET = new Set<string>(DESTINATIONS);

export function destinationFromPath(path: string, title = "") {
  const blob = `${path} ${title}`.toLowerCase();
  for (const id of DESTINATIONS) {
    if (blob.includes(id)) return id;
  }
  return "";
}

export function isDestination(value: string): value is DestinationId {
  return SET.has(value);
}

export function contentTypeFromPath(path: string) {
  const p = path.toLowerCase();
  if (/\/guides?\//.test(p) || /guide/.test(p)) return "guide";
  if (/\/blog/.test(p)) return "article";
  if (/hotel/.test(p)) return "hotel";
  if (/villa/.test(p)) return "hotel";
  if (/activit/.test(p)) return "activity";
  if (/rent-a-car|car/.test(p)) return "car_rental";
  if (/ferry/.test(p)) return "ferry";
  if (/flight/.test(p)) return "landing_page";
  if (/partner/.test(p)) return "partner";
  if (/touristas|quiz|chat/.test(p)) return "landing_page";
  if (DESTINATIONS.some((id) => p.includes(id))) return "destination";
  if (p === "/" || /^\/(en|el|de|fr)\/?$/.test(p)) return "landing_page";
  return "landing_page";
}

export function partnerTypeFromHref(href: string, path = "") {
  const blob = `${href} ${path}`.toLowerCase();
  if (/booking\.com|hotels\.com|expedia|airbnb|liteapi|hotel/.test(blob)) return "hotel";
  if (/ferryhopper|ferry/.test(blob)) return "ferry";
  if (/rentalcars|car/.test(blob)) return "car_rental";
  if (/getyourguide|viator|activit/.test(blob)) return "activity";
  if (/wa\.me|whatsapp/.test(blob)) return "whatsapp";
  return href ? "other" : "";
}
