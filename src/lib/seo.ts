import type { Metadata } from "next";
import { site } from "@/content/site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
  /** Short label shown above the title on the share image. */
  kicker?: string;
  /** Open Graph type; "article" for guides. */
  type?: "website" | "article";
};

/** The page title without the " | Beyonn" suffix, for share images. */
const short = (title: string) => title.replace(/\s*\|\s*Beyonn\s*$/i, "").replace(/\s*\|\s*OSA \+ TMD\s*$/i, "");

/** URL of the generated share image for a page (see app/og/route.tsx). */
export function ogImageUrl(title: string, kicker?: string) {
  const q = new URLSearchParams({ title: short(title) });
  if (kicker) q.set("kicker", kicker);
  return `/og?${q.toString()}`;
}

/**
 * Per-page metadata: absolute title, description, keywords, canonical URL,
 * Open Graph + Twitter cards with a page-specific share image, and robots.
 */
export function pageMeta({ title, description, path, keywords, noindex, kicker, type = "website" }: PageMeta): Metadata {
  const image = { url: ogImageUrl(title, kicker), width: 1200, height: 630, alt: short(title) };
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: "en_US",
      type,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}
