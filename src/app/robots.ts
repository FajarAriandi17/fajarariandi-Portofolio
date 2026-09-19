import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://fajarariandi.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The Studio is an authoring surface — indexing it would put an empty
        // login shell in search results.
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
