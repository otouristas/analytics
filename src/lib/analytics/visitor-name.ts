const ADJ = [
  "silver",
  "moccasin",
  "tomato",
  "quiet",
  "amber",
  "cedar",
  "ivory",
  "cobalt",
  "saffron",
  "willow",
  "obsidian",
  "coral",
  "nimbus",
  "copper",
  "linen",
];
const ANIMALS = [
  "peacock",
  "lion",
  "cod",
  "fox",
  "heron",
  "otter",
  "wren",
  "lynx",
  "seal",
  "kite",
  "hare",
  "orca",
  "moth",
  "elk",
  "tern",
];

export function visitorName(id: string) {
  let n = 0;
  for (const char of id) n = (n * 33 + char.charCodeAt(0)) >>> 0;
  return `${ADJ[n % ADJ.length]} ${ANIMALS[(n >> 5) % ANIMALS.length]}`;
}

export function flagEmoji(iso2: string) {
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return "";
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function formatDwell(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m} min ${s} sec`;
}

export function formatDwellShort(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatPct(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}
