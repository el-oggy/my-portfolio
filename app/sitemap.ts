import type { MetadataRoute } from "next";

const SITE_URL = "https://adarsh-vlsi.vercel.app/";

/**
 * Single-page portfolio — every section is an anchor of the root route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}#projects`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}#journey`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}#contact`, lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];
}
