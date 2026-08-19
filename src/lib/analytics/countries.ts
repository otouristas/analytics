import { scaleQuantile, scaleThreshold } from "d3-scale";
import {
  type Country,
  type MetricId,
  type RangeId,
  type Region,
  DIVERGING_COLORS,
  METRIC_BY_ID,
  QUANTILE_COLORS,
  scaledValue,
} from "./model";

type Seed = [
  id: string,
  iso3: string,
  name: string,
  region: Region,
  pop: number,
  weight: number,
  digital: number,
];

const SEEDS: Seed[] = [
  ["004", "AFG", "Afghanistan", "APAC", 41.1, 0.5, 0.22],
  ["008", "ALB", "Albania", "EMEA", 2.8, 0.5, 0.58],
  ["012", "DZA", "Algeria", "EMEA", 45.6, 2.1, 0.48],
  ["024", "AGO", "Angola", "EMEA", 35.6, 1.2, 0.32],
  ["031", "AZE", "Azerbaijan", "EMEA", 10.3, 1.1, 0.56],
  ["032", "ARG", "Argentina", "Americas", 45.8, 4.2, 0.72],
  ["036", "AUS", "Australia", "APAC", 26.6, 17.4, 0.91],
  ["040", "AUT", "Austria", "EMEA", 9.1, 5.2, 0.88],
  ["044", "BHS", "Bahamas", "Americas", 0.4, 0.3, 0.74],
  ["050", "BGD", "Bangladesh", "APAC", 171.2, 3.4, 0.41],
  ["051", "ARM", "Armenia", "EMEA", 3.0, 0.4, 0.62],
  ["056", "BEL", "Belgium", "EMEA", 11.7, 6.8, 0.89],
  ["064", "BTN", "Bhutan", "APAC", 0.8, 0.1, 0.46],
  ["068", "BOL", "Bolivia", "Americas", 12.2, 0.7, 0.52],
  ["070", "BIH", "Bosnia and Herzegovina", "EMEA", 3.2, 0.5, 0.61],
  ["072", "BWA", "Botswana", "EMEA", 2.6, 0.4, 0.54],
  ["076", "BRA", "Brazil", "Americas", 215.3, 18.6, 0.74],
  ["084", "BLZ", "Belize", "Americas", 0.4, 0.1, 0.51],
  ["090", "SLB", "Solomon Islands", "APAC", 0.7, 0.05, 0.28],
  ["096", "BRN", "Brunei", "APAC", 0.4, 0.3, 0.76],
  ["100", "BGR", "Bulgaria", "EMEA", 6.5, 1.4, 0.69],
  ["104", "MMR", "Myanmar", "APAC", 54.2, 0.8, 0.33],
  ["108", "BDI", "Burundi", "EMEA", 12.9, 0.1, 0.18],
  ["112", "BLR", "Belarus", "EMEA", 9.2, 1.1, 0.67],
  ["116", "KHM", "Cambodia", "APAC", 16.9, 0.7, 0.44],
  ["120", "CMR", "Cameroon", "EMEA", 27.9, 0.8, 0.34],
  ["124", "CAN", "Canada", "Americas", 39.8, 22.4, 0.92],
  ["140", "CAF", "Central African Republic", "EMEA", 5.6, 0.05, 0.14],
  ["144", "LKA", "Sri Lanka", "APAC", 22.2, 1.2, 0.51],
  ["148", "TCD", "Chad", "EMEA", 17.7, 0.2, 0.16],
  ["152", "CHL", "Chile", "Americas", 19.6, 3.6, 0.79],
  ["156", "CHN", "China", "APAC", 1412, 68.0, 0.76],
  ["158", "TWN", "Taiwan", "APAC", 23.4, 9.4, 0.9],
  ["170", "COL", "Colombia", "Americas", 52.1, 3.6, 0.68],
  ["178", "COG", "Congo", "EMEA", 6.0, 0.2, 0.28],
  ["180", "COD", "DR Congo", "EMEA", 99.0, 0.9, 0.2],
  ["188", "CRI", "Costa Rica", "Americas", 5.2, 0.9, 0.73],
  ["191", "HRV", "Croatia", "EMEA", 3.9, 1.0, 0.74],
  ["192", "CUB", "Cuba", "Americas", 11.2, 0.4, 0.42],
  ["196", "CYP", "Cyprus", "EMEA", 1.3, 0.5, 0.82],
  ["203", "CZE", "Czechia", "EMEA", 10.5, 3.4, 0.84],
  ["204", "BEN", "Benin", "EMEA", 13.4, 0.3, 0.31],
  ["208", "DNK", "Denmark", "EMEA", 5.9, 4.4, 0.94],
  ["214", "DOM", "Dominican Republic", "Americas", 11.2, 1.2, 0.61],
  ["218", "ECU", "Ecuador", "Americas", 18.0, 1.3, 0.62],
  ["222", "SLV", "El Salvador", "Americas", 6.3, 0.5, 0.56],
  ["226", "GNQ", "Equatorial Guinea", "EMEA", 1.7, 0.2, 0.36],
  ["231", "ETH", "Ethiopia", "EMEA", 123.4, 1.6, 0.27],
  ["232", "ERI", "Eritrea", "EMEA", 3.7, 0.05, 0.12],
  ["233", "EST", "Estonia", "EMEA", 1.4, 0.6, 0.91],
  ["238", "FLK", "Falkland Islands", "Americas", 0.004, 0.02, 0.7],
  ["242", "FJI", "Fiji", "APAC", 0.9, 0.1, 0.52],
  ["246", "FIN", "Finland", "EMEA", 5.6, 3.2, 0.93],
  ["250", "FRA", "France", "EMEA", 68.2, 28.4, 0.9],
  ["262", "DJI", "Djibouti", "EMEA", 1.1, 0.08, 0.33],
  ["266", "GAB", "Gabon", "EMEA", 2.4, 0.3, 0.46],
  ["268", "GEO", "Georgia", "EMEA", 3.7, 0.5, 0.66],
  ["270", "GMB", "Gambia", "EMEA", 2.7, 0.06, 0.3],
  ["275", "PSE", "Palestine", "EMEA", 5.4, 0.2, 0.48],
  ["276", "DEU", "Germany", "EMEA", 84.4, 38.2, 0.91],
  ["288", "GHA", "Ghana", "EMEA", 33.5, 1.3, 0.46],
  ["300", "GRC", "Greece", "EMEA", 10.3, 2.4, 0.78],
  ["304", "GRL", "Greenland", "Americas", 0.06, 0.08, 0.8],
  ["320", "GTM", "Guatemala", "Americas", 17.6, 1.1, 0.5],
  ["324", "GIN", "Guinea", "EMEA", 14.0, 0.3, 0.24],
  ["328", "GUY", "Guyana", "Americas", 0.8, 0.3, 0.55],
  ["332", "HTI", "Haiti", "Americas", 11.6, 0.2, 0.26],
  ["340", "HND", "Honduras", "Americas", 10.4, 0.5, 0.44],
  ["348", "HUN", "Hungary", "EMEA", 9.6, 2.2, 0.8],
  ["352", "ISL", "Iceland", "EMEA", 0.4, 0.4, 0.95],
  ["356", "IND", "India", "APAC", 1428, 26.4, 0.62],
  ["360", "IDN", "Indonesia", "APAC", 277.5, 11.2, 0.61],
  ["364", "IRN", "Iran", "EMEA", 88.6, 3.8, 0.58],
  ["368", "IRQ", "Iraq", "EMEA", 44.5, 2.0, 0.46],
  ["372", "IRL", "Ireland", "EMEA", 5.2, 5.4, 0.93],
  ["376", "ISR", "Israel", "EMEA", 9.8, 5.2, 0.9],
  ["380", "ITA", "Italy", "EMEA", 58.9, 16.2, 0.86],
  ["384", "CIV", "Côte d'Ivoire", "EMEA", 28.2, 1.0, 0.38],
  ["388", "JAM", "Jamaica", "Americas", 2.8, 0.3, 0.6],
  ["392", "JPN", "Japan", "APAC", 124.5, 42.0, 0.93],
  ["398", "KAZ", "Kazakhstan", "APAC", 19.6, 2.4, 0.72],
  ["400", "JOR", "Jordan", "EMEA", 11.3, 0.8, 0.64],
  ["404", "KEN", "Kenya", "EMEA", 54.0, 1.8, 0.48],
  ["408", "PRK", "North Korea", "APAC", 26.1, 0.05, 0.08],
  ["410", "KOR", "South Korea", "APAC", 51.7, 20.2, 0.94],
  ["414", "KWT", "Kuwait", "EMEA", 4.3, 1.8, 0.84],
  ["417", "KGZ", "Kyrgyzstan", "APAC", 6.8, 0.2, 0.5],
  ["418", "LAO", "Laos", "APAC", 7.6, 0.3, 0.38],
  ["422", "LBN", "Lebanon", "EMEA", 5.5, 0.4, 0.64],
  ["426", "LSO", "Lesotho", "EMEA", 2.3, 0.05, 0.32],
  ["428", "LVA", "Latvia", "EMEA", 1.8, 0.5, 0.84],
  ["430", "LBR", "Liberia", "EMEA", 5.3, 0.06, 0.22],
  ["434", "LBY", "Libya", "EMEA", 6.8, 0.6, 0.44],
  ["440", "LTU", "Lithuania", "EMEA", 2.8, 0.8, 0.85],
  ["442", "LUX", "Luxembourg", "EMEA", 0.7, 1.1, 0.95],
  ["450", "MDG", "Madagascar", "EMEA", 29.6, 0.3, 0.24],
  ["454", "MWI", "Malawi", "EMEA", 20.4, 0.2, 0.22],
  ["458", "MYS", "Malaysia", "APAC", 34.3, 4.2, 0.8],
  ["466", "MLI", "Mali", "EMEA", 22.6, 0.3, 0.26],
  ["478", "MRT", "Mauritania", "EMEA", 4.7, 0.15, 0.3],
  ["484", "MEX", "Mexico", "Americas", 128.5, 12.4, 0.7],
  ["496", "MNG", "Mongolia", "APAC", 3.4, 0.3, 0.62],
  ["498", "MDA", "Moldova", "EMEA", 2.5, 0.3, 0.63],
  ["499", "MNE", "Montenegro", "EMEA", 0.6, 0.15, 0.68],
  ["504", "MAR", "Morocco", "EMEA", 37.5, 1.8, 0.58],
  ["508", "MOZ", "Mozambique", "EMEA", 33.0, 0.4, 0.26],
  ["512", "OMN", "Oman", "EMEA", 4.6, 1.2, 0.78],
  ["516", "NAM", "Namibia", "EMEA", 2.6, 0.25, 0.52],
  ["524", "NPL", "Nepal", "APAC", 30.5, 0.6, 0.4],
  ["528", "NLD", "Netherlands", "EMEA", 17.7, 13.8, 0.94],
  ["540", "NCL", "New Caledonia", "APAC", 0.3, 0.12, 0.72],
  ["548", "VUT", "Vanuatu", "APAC", 0.3, 0.04, 0.36],
  ["554", "NZL", "New Zealand", "APAC", 5.2, 3.2, 0.91],
  ["558", "NIC", "Nicaragua", "Americas", 6.9, 0.25, 0.42],
  ["562", "NER", "Niger", "EMEA", 26.2, 0.2, 0.18],
  ["566", "NGA", "Nigeria", "EMEA", 223.8, 4.8, 0.42],
  ["578", "NOR", "Norway", "EMEA", 5.5, 6.2, 0.95],
  ["586", "PAK", "Pakistan", "APAC", 240.5, 3.6, 0.38],
  ["591", "PAN", "Panama", "Americas", 4.4, 0.9, 0.7],
  ["598", "PNG", "Papua New Guinea", "APAC", 10.1, 0.3, 0.26],
  ["600", "PRY", "Paraguay", "Americas", 6.8, 0.6, 0.56],
  ["604", "PER", "Peru", "Americas", 34.0, 2.6, 0.64],
  ["608", "PHL", "Philippines", "APAC", 117.3, 4.4, 0.62],
  ["616", "POL", "Poland", "EMEA", 37.6, 7.4, 0.82],
  ["620", "PRT", "Portugal", "EMEA", 10.4, 2.8, 0.84],
  ["624", "GNB", "Guinea-Bissau", "EMEA", 2.1, 0.04, 0.2],
  ["626", "TLS", "Timor-Leste", "APAC", 1.3, 0.05, 0.3],
  ["630", "PRI", "Puerto Rico", "Americas", 3.2, 1.4, 0.8],
  ["634", "QAT", "Qatar", "EMEA", 2.7, 2.4, 0.9],
  ["642", "ROU", "Romania", "EMEA", 19.0, 3.2, 0.76],
  ["643", "RUS", "Russia", "EMEA", 144.2, 8.6, 0.74],
  ["646", "RWA", "Rwanda", "EMEA", 13.8, 0.25, 0.4],
  ["682", "SAU", "Saudi Arabia", "EMEA", 36.4, 8.4, 0.82],
  ["686", "SEN", "Senegal", "EMEA", 17.7, 0.6, 0.4],
  ["688", "SRB", "Serbia", "EMEA", 6.6, 1.0, 0.7],
  ["694", "SLE", "Sierra Leone", "EMEA", 8.6, 0.08, 0.22],
  ["703", "SVK", "Slovakia", "EMEA", 5.4, 1.4, 0.8],
  ["704", "VNM", "Vietnam", "APAC", 98.9, 4.0, 0.68],
  ["705", "SVN", "Slovenia", "EMEA", 2.1, 0.7, 0.86],
  ["706", "SOM", "Somalia", "EMEA", 17.6, 0.1, 0.16],
  ["710", "ZAF", "South Africa", "EMEA", 60.4, 4.2, 0.66],
  ["716", "ZWE", "Zimbabwe", "EMEA", 16.3, 0.3, 0.36],
  ["724", "ESP", "Spain", "EMEA", 47.8, 13.2, 0.87],
  ["728", "SSD", "South Sudan", "EMEA", 11.1, 0.06, 0.12],
  ["729", "SDN", "Sudan", "EMEA", 46.9, 0.5, 0.24],
  ["732", "ESH", "Western Sahara", "EMEA", 0.6, 0.02, 0.2],
  ["740", "SUR", "Suriname", "Americas", 0.6, 0.08, 0.54],
  ["748", "SWZ", "Eswatini", "EMEA", 1.2, 0.08, 0.4],
  ["752", "SWE", "Sweden", "EMEA", 10.5, 7.6, 0.94],
  ["756", "CHE", "Switzerland", "EMEA", 8.8, 10.8, 0.95],
  ["760", "SYR", "Syria", "EMEA", 22.1, 0.2, 0.28],
  ["762", "TJK", "Tajikistan", "APAC", 10.0, 0.15, 0.36],
  ["764", "THA", "Thailand", "APAC", 71.7, 5.2, 0.74],
  ["768", "TGO", "Togo", "EMEA", 8.8, 0.15, 0.3],
  ["780", "TTO", "Trinidad and Tobago", "Americas", 1.5, 0.35, 0.68],
  ["784", "ARE", "United Arab Emirates", "EMEA", 9.4, 6.2, 0.92],
  ["788", "TUN", "Tunisia", "EMEA", 12.4, 0.8, 0.6],
  ["792", "TUR", "Turkey", "EMEA", 85.3, 7.4, 0.72],
  ["795", "TKM", "Turkmenistan", "APAC", 6.4, 0.4, 0.42],
  ["800", "UGA", "Uganda", "EMEA", 47.2, 0.7, 0.32],
  ["804", "UKR", "Ukraine", "EMEA", 38.0, 2.2, 0.66],
  ["807", "MKD", "North Macedonia", "EMEA", 1.8, 0.25, 0.64],
  ["818", "EGY", "Egypt", "EMEA", 110.0, 3.8, 0.52],
  ["826", "GBR", "United Kingdom", "EMEA", 67.7, 34.0, 0.92],
  ["834", "TZA", "Tanzania", "EMEA", 65.5, 1.1, 0.3],
  ["840", "USA", "United States", "Americas", 333.3, 100, 0.94],
  ["854", "BFA", "Burkina Faso", "EMEA", 22.7, 0.25, 0.24],
  ["858", "URY", "Uruguay", "Americas", 3.4, 0.8, 0.78],
  ["860", "UZB", "Uzbekistan", "APAC", 35.6, 1.0, 0.5],
  ["862", "VEN", "Venezuela", "Americas", 28.3, 0.8, 0.46],
  ["887", "YEM", "Yemen", "EMEA", 33.7, 0.2, 0.2],
  ["894", "ZMB", "Zambia", "EMEA", 20.0, 0.35, 0.32],
  ["n:Kosovo", "XKX", "Kosovo", "EMEA", 1.8, 0.2, 0.58],
  ["n:Somaliland", "SOL", "Somaliland", "EMEA", 5.7, 0.12, 0.26],
  ["n:N. Cyprus", "NCY", "Northern Cyprus", "EMEA", 0.4, 0.08, 0.62],
];

const GROWTH_OVERRIDE: Record<string, number> = {
  "840": 0.064,
  "156": 0.108,
  "392": 0.032,
  "276": 0.048,
  "826": 0.056,
  "250": 0.044,
  "356": 0.246,
  "124": 0.061,
  "410": 0.052,
  "076": 0.094,
  "036": 0.058,
  "380": 0.036,
  "528": 0.054,
  "724": 0.041,
  "484": 0.088,
  "360": 0.198,
  "756": 0.038,
  "752": 0.049,
  "616": 0.072,
  "682": 0.112,
  "792": 0.086,
  "578": 0.041,
  "784": 0.134,
  "566": 0.312,
  "704": 0.224,
  "608": 0.186,
  "050": 0.208,
  "404": 0.194,
  "643": -0.042,
  "032": 0.018,
  "804": -0.086,
  "408": -0.02,
  "887": -0.064,
  "760": -0.11,
  "728": -0.034,
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedNumber(id: string): number {
  const numeric = Number(id);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeSeries(end: number, growth: number, rng: () => number): number[] {
  const months = 12;
  const points: number[] = [];
  let value = end / Math.pow(1 + growth / 12, months - 1);
  for (let i = 0; i < months; i += 1) {
    value *= 1 + growth / 12 + (rng() - 0.5) * 0.055;
    points.push(Math.max(end * 0.12, value));
  }
  const last = points[points.length - 1] || end;
  const scale = end / last;
  return points.map((point) => point * scale);
}

function buildCountry(seed: Seed): Country {
  const [id, iso3, name, region, pop, weight, digital] = seed;
  const rng = mulberry32(seedNumber(id) * 9973);
  const jitter = 0.9 + rng() * 0.2;
  const revenue = weight * 4_180_000 * jitter;
  const users = Math.max(400, pop * digital * 18_400 * (0.86 + rng() * 0.28));
  const growth =
    GROWTH_OVERRIDE[id] ??
    (1 - digital) * 0.26 + 0.028 + (rng() - 0.48) * 0.07;
  const conversion = Math.min(
    0.128,
    Math.max(0.008, 0.014 + digital * 0.056 + (rng() - 0.5) * 0.01),
  );
  const arpu = revenue / users;
  return {
    id,
    iso3,
    name,
    region,
    population: pop * 1_000_000,
    revenue,
    users,
    growth,
    conversion,
    arpu,
    revenueSeries: makeSeries(revenue, growth, rng),
    usersSeries: makeSeries(users, growth * 0.72, rng),
  };
}

export const COUNTRIES: Country[] = SEEDS.map(buildCountry);

export const COUNTRY_BY_ID = new Map(COUNTRIES.map((country) => [country.id, country]));

export const SKIP_IDS = new Set(["010", "260"]);

export function normalizeGeoId(raw: string | number | undefined, name?: string): string {
  if (raw != null && String(raw).length > 0) {
    const text = String(raw);
    if (/^\d+$/.test(text)) return text.padStart(3, "0");
    return text;
  }
  if (name) return `n:${name}`;
  return "unknown";
}

export function getCountry(id: string): Country | undefined {
  return COUNTRY_BY_ID.get(id);
}

export function metricValues(metric: MetricId, range: RangeId): number[] {
  return COUNTRIES.map((country) => scaledValue(country, metric, range));
}

export function colorForValue(
  value: number,
  metric: MetricId,
  range: RangeId,
): string {
  const def = METRIC_BY_ID[metric];
  if (def.scale === "diverging") {
    const scale = scaleThreshold<number, string>()
      .domain([-0.08, -0.03, 0.02, 0.08, 0.16, 0.24])
      .range([...DIVERGING_COLORS]);
    return scale(value);
  }
  const scale = scaleQuantile<string>()
    .domain(metricValues(metric, range))
    .range([...QUANTILE_COLORS]);
  return scale(value);
}

export function quantileThresholds(metric: MetricId, range: RangeId): number[] {
  const scale = scaleQuantile<string>()
    .domain(metricValues(metric, range))
    .range([...QUANTILE_COLORS]);
  return scale.quantiles();
}

export function rankedCountries(metric: MetricId, range: RangeId): Country[] {
  return [...COUNTRIES].sort(
    (a, b) => scaledValue(b, metric, range) - scaledValue(a, metric, range),
  );
}

export function countryRank(id: string, metric: MetricId, range: RangeId): number {
  return rankedCountries(metric, range).findIndex((country) => country.id === id) + 1;
}

export type Totals = {
  revenue: number;
  users: number;
  growth: number;
  conversion: number;
  arpu: number;
  countries: number;
};

export function computeTotals(list: Country[], range: RangeId): Totals {
  const factor = range === "30d" ? 0.33 : range === "ytd" ? 2.68 : range === "12m" ? 4.05 : 1;
  const scaledRevenue = list.reduce((sum, country) => sum + country.revenue * factor, 0);
  const users = list.reduce((sum, country) => sum + country.users * metricUsersFactor(range), 0);
  const conversion =
    list.reduce((sum, country) => sum + country.conversion * country.users, 0) /
    Math.max(1, list.reduce((sum, country) => sum + country.users, 0));
  const growth =
    list.reduce((sum, country) => sum + country.growth * country.revenue, 0) /
    Math.max(1, list.reduce((sum, country) => sum + country.revenue, 0));
  return {
    revenue: scaledRevenue,
    users,
    growth,
    conversion,
    arpu: scaledRevenue / Math.max(1, users),
    countries: list.length,
  };
}

function metricUsersFactor(range: RangeId): number {
  if (range === "30d") return 0.62;
  if (range === "ytd") return 1.35;
  if (range === "12m") return 1.55;
  return 1;
}

export function regionTotals(range: RangeId): { region: Region; totals: Totals; share: number }[] {
  const world = computeTotals(COUNTRIES, range);
  const regions: Region[] = ["Americas", "EMEA", "APAC"];
  return regions.map((region) => {
    const totals = computeTotals(
      COUNTRIES.filter((country) => country.region === region),
      range,
    );
    return { region, totals, share: totals.revenue / Math.max(1, world.revenue) };
  });
}

export function globalSeries(metric: MetricId): { month: string; value: number }[] {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const def = METRIC_BY_ID[metric];
  return months.map((month, index) => {
    if (metric === "growth") {
      const current = COUNTRIES.reduce((sum, country) => sum + (country.revenueSeries[index] ?? 0), 0);
      const previous = COUNTRIES.reduce(
        (sum, country) => sum + (country.revenueSeries[Math.max(0, index - 1)] ?? 0),
        0,
      );
      return { month, value: index === 0 ? 0.05 : current / Math.max(1, previous) - 1 };
    }
    if (metric === "conversion") {
      const users = COUNTRIES.reduce((sum, country) => sum + (country.usersSeries[index] ?? 0), 0);
      const weighted = COUNTRIES.reduce(
        (sum, country) => sum + country.conversion * (country.usersSeries[index] ?? 0),
        0,
      );
      return { month, value: weighted / Math.max(1, users) };
    }
    if (metric === "arpu") {
      const revenue = COUNTRIES.reduce((sum, country) => sum + (country.revenueSeries[index] ?? 0), 0);
      const users = COUNTRIES.reduce((sum, country) => sum + (country.usersSeries[index] ?? 0), 0);
      return { month, value: revenue / Math.max(1, users) };
    }
    const value = COUNTRIES.reduce((sum, country) => sum + (def.series(country)[index] ?? 0), 0);
    return { month, value };
  });
}

export function totalFor(totals: Totals, metric: MetricId): number {
  if (metric === "revenue") return totals.revenue;
  if (metric === "users") return totals.users;
  if (metric === "growth") return totals.growth;
  if (metric === "conversion") return totals.conversion;
  return totals.arpu;
}
