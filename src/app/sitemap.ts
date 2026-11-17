import { connection } from "next/server";
import { getPublished } from "@/lib/cms/server/content";
import type { Article } from "@/content/articles";
import type { MetadataRoute } from "next";

/** Pages that should not be indexed (sign-in screens and legal notices). */
const hidden = new Set([
  "portal",
  "partner-login",
  "privacy",
  "terms",
  "hipaa",
]);

const priority: Record<string, number> = {
  "the-beyonn-system": 0.9,
  partner: 0.9,
  academy: 0.9,
  patients: 0.9,
  "patients/find-a-provider": 0.8,
  qualify: 0.8,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const document = await getPublished();
  const base = String((document.data.site as { url: string }).url).replace(
    /\/$/,
    "",
  );
  const pages = document.data.pages as object;
  const articles = document.data.articles as unknown as Article[];
  const now = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.keys(pages)
      .filter((k) => !hidden.has(k))
      .map((k) => ({
        url: `${base}/${k}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: priority[k] ?? 0.6,
      })),
    {
      url: `${base}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles.map((a) => ({
      url: `${base}/resources/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
