import type { MetadataRoute } from "next";

import { PAGES } from "./(docs)/markdown";

/**
 * Every page the site serves, from the same registry the markdown twins walk, so the sitemap
 * cannot list a page that does not exist or miss one that does. The three indexes are not in
 * `PAGES` because they have no twin.
 *
 * No URL constant: the origin is the one Next resolves `metadataBase` from, Vercel's production
 * domain, or localhost in development.
 */
const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT ?? 1403}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/components", "/blocks", ...PAGES.map((page) => page.path)];
  return paths.map((path) => ({ url: new URL(path, origin).href }));
}
