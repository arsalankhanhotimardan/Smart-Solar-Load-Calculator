
export const dynamic = "force-static";
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Protect private server actions
    },
    sitemap: 'https://www.voltpulse.com/sitemap.xml',
  };
}