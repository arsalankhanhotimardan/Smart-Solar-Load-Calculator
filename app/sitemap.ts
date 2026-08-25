import { MetadataRoute } from 'next';
import { PAKISTAN_CITIES } from './citiesData';
const baseUrl = 'https://smart-solar-load-calculator.pages.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  baseUrl = 'https://www.voltpulse.com';

  // 1. Static Core Pages
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // 2. Programmatic City Landing Pages (Loops through all cities automatically)
  const cityPages = Object.keys(PAKISTAN_CITIES).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}