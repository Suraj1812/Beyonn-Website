import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/portal", "/partner-login", "/control", "/api/control", "/local"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
