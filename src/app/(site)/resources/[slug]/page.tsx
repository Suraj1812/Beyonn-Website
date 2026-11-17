import ArticleContent from "@/components/control/ArticleContent";
import { articles, type Article } from "@/content/articles";
import { getContent, getPublished } from "@/lib/cms/server/content";
import { getSession } from "@/lib/cms/server/session";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { connection } from "next/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  await connection();
  const document = await getPublished();
  const slug = (await params).slug;
  const article = (document.data.articles as unknown as Article[]).find(
    (a) => a.slug === slug,
  );
  if (!article) return {};
  return pageMeta({
    title:
      document.seo[`/resources/${slug}`]?.title || `${article.title} | Beyonn`,
    description:
      document.seo[`/resources/${slug}`]?.description || article.excerpt,
    path: `/resources/${article.slug}`,
    keywords: article.keywords,
    kicker:
      article.audience === "patients"
        ? "Guide for patients"
        : "Guide for practitioners",
    type: "article",
  });
}

/** Blocking so unknown slugs return a real 404 status (see [...slug]/page.tsx). */
export const instant = false;

export default async function ResourceArticle({ params, searchParams }: Props) {
  await connection();
  const slug = (await params).slug;
  let document = await getPublished();
  if ((await searchParams)["cms-preview"] === "1" && (await getSession()))
    document = (await getContent("draft")) ?? document;
  const article = (document.data.articles as unknown as Article[]).find(
    (article) => article.slug === slug,
  );
  if (!article) notFound();
  return <ArticleContent slug={slug} fallback={article} />;
}
