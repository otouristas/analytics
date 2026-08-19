const PAGE_RULES: [RegExp, string][] = [
  [/santorini|oia|thira|thirasia/, "/pages/santorini.jpg"],
  [/mykonos/, "/pages/mykonos.jpg"],
  [/naxos/, "/pages/naxos.jpg"],
  [/milos|kimolos/, "/pages/milos.jpg"],
  [/paros|antiparos|ios|sifnos|folegandros|amorgos/, "/pages/naxos.jpg"],
  [/ferry/, "/pages/ferry.jpg"],
  [/hotel|villa|stay|booking/, "/pages/hotel.jpg"],
  [/flight|airport/, "/pages/flights.jpg"],
  [/car|rent/, "/pages/car.jpg"],
  [/weather/, "/pages/weather.jpg"],
  [/pack/, "/pages/packing.jpg"],
  [/touristas|chat|quiz|ai/, "/pages/ai.jpg"],
  [/^\/$|\/en$|\/el$|home/, "/pages/home.jpg"],
];

export function pageArt(path: string, title = "") {
  const text = `${path} ${title}`.toLowerCase();
  for (const [re, src] of PAGE_RULES) {
    if (re.test(text)) return src;
  }
  return "/pages/home.jpg";
}

const EVENT_ART: Record<string, string> = {
  pageview: "/events/pageview.jpg",
  click: "/events/click.jpg",
  outbound: "/events/outbound.jpg",
  exit: "/events/exit.jpg",
  form: "/events/form.jpg",
  scroll: "/events/scroll.jpg",
  download: "/events/download.jpg",
  conversion: "/events/conversion.jpg",
  custom: "/events/conversion.jpg",
  heartbeat: "/events/heartbeat.jpg",
  vital: "/events/pageview.jpg",
};

export function eventArt(kind: string, label = "") {
  if (/book|purchase|partner|lead/i.test(label)) return EVENT_ART.conversion;
  return EVENT_ART[kind] ?? EVENT_ART.pageview;
}

export function projectIcon(id: string) {
  if (id === "cyclades") return "/brands/cyclades.png";
  return "";
}
