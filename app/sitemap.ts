import type { MetadataRoute } from "next";

const SITE_URL = "https://adarsh-vlsi.vercel.app/";

/**
 * Single-page portfolio with virtual room routes. The room paths are
 * server-rewritten to "/" and client-canonicalized — Google indexes them
 * as real URLs. (Fragment anchors like /#projects are ignored by search
 * engines, so they are deliberately not listed.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}gallery`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}studio`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}about`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}contact`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}email`, lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];
}
