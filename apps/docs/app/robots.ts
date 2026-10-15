import type { MetadataRoute } from "next";

/** Closed to crawlers until the first npm release, with the root layout's `noindex`. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
