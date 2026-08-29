import { MetadataRoute } from 'next';

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], 
    },
    // Updated to your actual Cloudflare Pages domain
    sitemap: 'https://solarcalculator.greenengineeringtools.com/sitemap.xml',
  };
}