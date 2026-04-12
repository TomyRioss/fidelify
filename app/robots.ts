import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/tienda/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/tienda/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/tienda/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/tienda/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/tienda/"],
      },
    ],
    sitemap: "https://fielgo.com/sitemap.xml",
  };
}
