"use client";
import { Localized } from "@/components/i18n/Localized";
import Link from "next/link";
import { useCmsData } from "./CmsProvider";

import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollExit } from "@/components/visual/ScrollExit";
import { articles, type Article } from "@/content/articles";
import { site } from "@/content/site";
import { ogImageUrl } from "@/lib/seo";
export default function ResourceArticle({
  slug,
  fallback,
}: {
  slug: string;
  fallback?: Article;
}) {
  const items = useCmsData("articles", articles);
  const article = items.find((a) => a.slug === slug) ?? fallback;
  if (!article) return null;
  return (
    <Localized>
      {
        <>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              keywords: article.keywords.join(", "),
              audience: {
                "@type": "Audience",
                audienceType:
                  article.audience === "patients"
                    ? "Patients"
                    : "Dental and medical practitioners",
              },
              author: {
                "@type": "Organization",
                name: "Beyonn",
                url: site.url,
              },
              publisher: {
                "@type": "Organization",
                name: "Beyonn",
                logo: {
                  "@type": "ImageObject",
                  url: `${site.url}/assets/beyonn-logo.png`,
                },
              },
              mainEntityOfPage: `${site.url}/resources/${article.slug}`,
              image: `${site.url}${ogImageUrl(article.title)}`,
            }}
          />
          <header
            data-cms-hero
            className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-ink),var(--color-night))] px-5 pb-10 pt-32 text-paper sm:pb-24 sm:pt-48"
          >
            <div
              data-morph-shape="emblem"
              data-morph-hide
              className="pointer-events-none absolute -right-24 top-1/2 aspect-[1600/1306] w-[34rem] -translate-y-1/2 bg-paper/[0.07] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[46rem]"
              aria-hidden
            />
            <ScrollExit y={60} fade className="relative mx-auto max-w-4xl">
              <Link
                href="/resources"
                data-aos="fade-up"
                className="t-eyebrow text-breath hover:underline"
              >
                ← All resources
              </Link>
              <p
                data-aos="fade-up"
                data-aos-delay="60"
                className="mt-10 t-eyebrow text-paper/60"
              >
                {article.audience === "patients"
                  ? "For patients"
                  : "For practitioners"}{" "}
                · {article.minutes} min read
              </p>
              <h1 data-aos="fade-up" data-aos-delay="120" className="mt-5 t-h1">
                {article.title}
              </h1>
              <p
                data-aos="fade-up"
                data-aos-delay="180"
                className="mt-7 max-w-2xl t-lead text-paper/80"
              >
                {article.excerpt}
              </p>
            </ScrollExit>
          </header>
          <article className="mx-auto max-w-3xl px-5 py-10 sm:py-28">
            {article.body.map((block, index) => (
              <section
                key={`${article.slug}-${index}`}
                className="mb-8 sm:mb-12"
              >
                {block.h && (
                  <h2 data-aos="fade-up" className="t-h3 mb-6">
                    {block.h}
                  </h2>
                )}
                {block.p.map((paragraph) => (
                  <p
                    key={paragraph}
                    data-aos="fade-up"
                    className="mb-5 text-base leading-[1.75] sm:text-lg sm:leading-[1.8] text-text/80"
                  >
                    {paragraph}
                  </p>
                ))}
                {block.list && (
                  <ul
                    data-morph-shape="rect"
                    data-aos="fade-up"
                    className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-ink/10 bg-paper-2 p-6 pl-8"
                  >
                    {block.list.map((item) => (
                      <li key={item} className="leading-relaxed text-text/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {article.audience === "patients" && (
              <p
                data-aos="fade-up"
                className="border-t border-ink/15 pt-6 text-sm text-muted"
              >
                For general education only. This is not medical advice or a
                diagnosis. Discuss your symptoms with a qualified provider.
              </p>
            )}
            <div
              data-aos="fade-up"
              className="mt-16 border-t border-ink/15 pt-8"
            >
              <Link
                href={
                  article.audience === "patients"
                    ? "/patients"
                    : "/the-beyonn-system"
                }
                className="btn btn--dawn"
              >
                <span>
                  {article.audience === "patients"
                    ? "Explore patient care"
                    : "Explore the Beyonn system"}
                </span>
              </Link>
            </div>
          </article>
        </>
      }
    </Localized>
  );
}

// Prevent parent boundaries from translating this component before it renders.
ResourceArticle.cmsLocalizedBoundary = true;
