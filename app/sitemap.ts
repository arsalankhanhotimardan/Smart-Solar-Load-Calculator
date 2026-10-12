import type { MetadataRoute } from "next";
import { CITIES, UNIT_LEVELS, unitsSlug } from "./lib/solar-cities";

export const dynamic = "force-static";

const base = "https://solarcalculator.greenengineeringtools.com";
const updated = new Date("2026-10-12");

export default function sitemap(): MetadataRoute.Sitemap {
  const systemSizes = ["1kw", "2kw", "3kw", "4kw", "5kw", "6kw", "7-5kw", "8kw", "10kw", "12kw", "15kw", "20kw"];

  return [
    { url: `${base}/` },
    { url: `${base}/units-to-solar-calculator`, lastModified: updated },
    { url: `${base}/battery-runtime-calculator` },
    { url: `${base}/solar-battery-charging-time-calculator` },
    { url: `${base}/methodology` },
    { url: `${base}/disclaimer` },
    ...systemSizes.map((size) => ({ url: `${base}/system-size/${size}` })),
    ...UNIT_LEVELS.map((u) => ({ url: `${base}/solar-system-for/${unitsSlug(u)}`, lastModified: updated })),
    { url: `${base}/solar-calculator`, lastModified: updated },
    ...CITIES.map((c) => ({ url: `${base}/solar-calculator/${c.slug}`, lastModified: updated })),
    { url: `${base}/about` },
    { url: `${base}/contact` },
    { url: `${base}/privacy` },
    { url: `${base}/terms` },
  ];
}
