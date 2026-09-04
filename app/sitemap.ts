import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://solarcalculator.greenengineeringtools.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const systemSizes = ["3kw", "5kw", "7-5kw", "10kw", "15kw", "20kw"];

  return [
    { url: `${base}/` },
    { url: `${base}/methodology` },
    { url: `${base}/disclaimer` },
    ...systemSizes.map((size) => ({ url: `${base}/system-size/${size}` })),
    { url: `${base}/about` },
    { url: `${base}/contact` },
    { url: `${base}/privacy` },
    { url: `${base}/terms` },
  ];
}
