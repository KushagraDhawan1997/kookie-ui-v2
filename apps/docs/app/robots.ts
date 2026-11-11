import type { MetadataRoute } from "next";

/**
 * Open to crawlers (2026-11-11, Kushagra: "expose it"). The scratch and figure-shooting routes
 * stay out: they answer 404 on the live site, and a crawler has no reason to ask for them.
 */
const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT ?? 1403}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/lab", "/lab2", "/lab3", "/scratch-", "/shoot/"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
