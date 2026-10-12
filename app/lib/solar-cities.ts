import { PAKISTAN_CITIES, type CityInfo } from "../citiesData";

export const CITIES: CityInfo[] = Object.values(PAKISTAN_CITIES).sort((a, b) => a.name.localeCompare(b.name));

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);

/** Mean of the dataset's planning peak-sun-hour values, rounded to 0.1. */
export const AVERAGE_PSH = Math.round((CITIES.reduce((sum, c) => sum + c.avgPeakSunHours, 0) / CITIES.length) * 10) / 10;

/** Minimal serialisable shape passed to client components. */
export const CITY_OPTIONS = CITIES.map((c) => ({ slug: c.slug, name: c.name, province: c.province, disco: c.disco, psh: c.avgPeakSunHours }));

export const UNIT_LEVELS = [200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 2000] as const;

export const unitsSlug = (units: number) => `${units}-units-per-month`;
export const unitsFromSlug = (slug: string) => {
  const match = slug.match(/^(\d+)-units-per-month$/);
  const units = match ? Number(match[1]) : NaN;
  return (UNIT_LEVELS as readonly number[]).includes(units) ? units : null;
};

export const SITE = "https://solarcalculator.greenengineeringtools.com";

/** Serialises JSON-LD for a <script> tag, escaping "<". */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
