import { getPublished, getContent } from "@/lib/cms/server/content";
import { getSession } from "@/lib/cms/server/session";
import { connection } from "next/server";
import type { ContentPage } from "@/content/pages";
import PageContent from "@/components/control/PageContent";
import { notFound } from "next/navigation";
import { pages } from "@/content/pages";
import { pageMeta } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return Object.keys(pages).map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const key = (await params).slug.join("/");
  await connection();
  const document = await getPublished();
  const page = (document.data.pages as unknown as Record<string, ContentPage>)[
    key
  ];
  if (!page) return {};
  return pageMeta({
    title:
      document.seo[`/${key}`]?.title ||
      page.seo?.title ||
      `${page.title} | Beyonn`,
    description:
      document.seo[`/${key}`]?.description ||
      page.seo?.description ||
      page.description,
    keywords: page.seo?.keywords,
    path: `/${key}`,
    kicker: page.eyebrow,
    noindex: NOINDEX.includes(key),
  });
}

const NOINDEX = ["portal", "partner-login", "privacy", "terms", "hipaa"];

/**
 * Blocking on purpose: the slug is checked before any HTML is sent, so unknown
 * URLs return a real 404 status instead of a 200 page that says "not found".
 * Every known page is still prerendered via generateStaticParams.
 */
export const instant = false;

export default async function ContentRoute({ params, searchParams }: Props) {
  const key = (await params).slug.join("/");
  await connection();
  let document = await getPublished();
  if ((await searchParams)["cms-preview"] === "1" && (await getSession()))
    document = (await getContent("draft")) ?? document;
  const page = (document.data.pages as unknown as Record<string, ContentPage>)[
    key
  ];
  if (!page) notFound();
  return <PageContent pageKey={key} fallback={page} />;
}
