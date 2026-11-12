import { Localized } from "@/components/i18n/Localized";
import { notFound } from "next/navigation";
import { TeamHeroPortraits } from "@/components/sections/TeamHeroPortraits";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { ContentSection, ActionButton } from "@/components/sections/ContentSection";
import { SectionJumps } from "@/components/ui/SectionJumps";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { pages } from "@/content/pages";
import { pageMeta } from "@/lib/seo";
import { Parallax } from "@/components/visual/Parallax";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { Tilt } from "@/components/visual/Tilt";
import { FeatureCards } from "@/components/sections/FeatureCards";
import Image from "next/image";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return Object.keys(pages).map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const key = (await params).slug.join("/");
  const page = pages[key];
  if (!page) return {};
  return pageMeta({
    title: page.seo?.title ?? `${page.title} | Beyonn`,
    description: page.seo?.description ?? page.description,
    keywords: page.seo?.keywords,
    path: `/${key}`,
    kicker: page.eyebrow,
    noindex: NOINDEX.includes(key),
  });
}

const paragraphText = (body: string | string[]) => (Array.isArray(body) ? body.join(" ") : body);

const NOINDEX = ["portal", "partner-login", "privacy", "terms", "hipaa"];

/**
 * Blocking on purpose: the slug is checked before any HTML is sent, so unknown
 * URLs return a real 404 status instead of a 200 page that says "not found".
 * Every known page is still prerendered via generateStaticParams.
 */
export const instant = false;

export default async function ContentRoute({ params }: Props) {
  const key = (await params).slug.join("/");
  const page = pages[key];
  if (!page) notFound();
  const legacy = !page.closing && !page.actions && Boolean(page.cta);
  const patient = key.startsWith("patients") || key === "patient-app" || key === "portal";

  const crumbs = key.split("/").map((_, i, parts) => {
    const k = parts.slice(0, i + 1).join("/");
    return { "@type": "ListItem", position: i + 2, name: pages[k]?.title ?? parts[i], item: `${site.url}/${k}` };
  });
  const faqText = page.sections.flatMap((section) => section.faq ?? []).filter((f) => typeof f.a === "string");
  const jumpLinks = page.sections.flatMap(({ id }) => id ? [{
    id,
    label: id === "faq" || id === "tmd" ? id.toUpperCase() : id.charAt(0).toUpperCase() + id.slice(1).replaceAll("-", " "),
  }] : []);
  if (page.closing?.id) jumpLinks.push({ id: page.closing.id, label: page.closing.id === "book" ? "Discovery call" : "Next step" });
  const hero = page.photo
    ? { src: page.photo, alt: page.photoAlt ?? page.title, mode: key === "dr-rodney-willey" ? ("contain" as const) : ("cover" as const) }
    : undefined;

  return <Localized>{(
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site.url }, ...crumbs],
        }}
      />
      {faqText.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqText.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <PageHero
        visual={key === "team" ? <TeamHeroPortraits /> : undefined}
        kicker={legacy ? undefined : page.eyebrow}
        title={page.title}
        headline={page.headline}
        sub={
          page.heroLine ? (
            <>
              <p>{page.description}</p>
              <p className="mt-5 font-semibold text-paper">{page.heroLine}</p>
            </>
          ) : (
            page.description
          )
        }
        photo={hero}
        actions={
          page.actions ? (
            <>
              {page.actions.map((a) => (
                <ActionButton key={a.label} action={a} />
              ))}
            </>
          ) : (
            page.cta && <Button href={page.cta.href} variant="dawn">{page.cta.label}</Button>
          )
        }
      />
      <SectionJumps links={jumpLinks} />
      {!legacy && page.sections.map((section, index) => <ContentSection key={section.id ?? section.title ?? section.eyebrow ?? index} section={section} index={index} />)}
      {legacy && page.sections.map((section, index) => {
        const tone = index % 2 === 0 ? "bg-paper" : "bg-paper-2";
        const flip = index % 2 === 1;

        // Photo + copy, with the points as feature cards underneath.
        if (section.image) {
          return (
            <section key={section.title} id={section.id} className={`section-y ${tone}`}>
              <div className="container-x grid items-center gap-6 sm:gap-12 lg:grid-cols-2 lg:gap-14">
                <div className={flip ? "lg:order-2" : ""}>
                  <SectionHeading eyebrow={section.eyebrow} title={section.title ?? ""} />
                  {section.body && <p data-aos="fade-up" className="mt-7 max-w-2xl t-lead text-muted">{paragraphText(section.body)}</p>}
                </div>
                <Parallax speed={0.05} className={flip ? "lg:order-1" : ""}>
                  <Tilt className="rounded-[var(--radius-panel)]" max={4}>
                    <div data-morph-shape="rect" data-aos="reveal" data-aos-duration="1200" className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2 shadow-[0_30px_60px_-38px_rgb(19_37_62/0.55)]">
                      <Image src={section.image} alt={section.imageAlt ?? section.title ?? ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                    </div>
                  </Tilt>
                </Parallax>
              </div>
              {section.points && <FeatureCards points={section.points} className="container-x mt-12 md:grid-cols-2 lg:grid-cols-3" />}
            </section>
          );
        }

        // Points only: heading stays put while the cards scroll beside it.
        if (section.points) {
          return (
            <section key={section.title} id={section.id} className={`section-y ${tone}`}>
              <div className="container-x grid gap-6 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeading eyebrow={section.eyebrow} title={section.title ?? ""} />
                  {section.body && <p data-aos="fade-up" className="mt-7 max-w-xl t-lead text-muted">{paragraphText(section.body)}</p>}
                </div>
                <FeatureCards points={section.points} className={section.points.length > 3 ? "sm:grid-cols-2" : ""} />
              </div>
            </section>
          );
        }

        // Copy only: a light statement panel (navy is kept for the closing CTA).
        return (
          <section key={section.title} id={section.id} className={`section-y ${tone}`}>
            <div className="container-x">
              <div data-morph-shape="rect" className={`relative isolate overflow-hidden rounded-[var(--radius-panel)] border border-ink/10 px-5 py-8 sm:px-14 sm:py-20 ${index % 2 === 0 ? "bg-paper-2" : "bg-white"}`}>
                <div className="pointer-events-none absolute -bottom-24 -right-20 -z-10 aspect-[1600/1306] w-[30rem] bg-dawn/[0.08] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[40rem]" aria-hidden />
                <SectionHeading eyebrow={section.eyebrow} title={section.title ?? ""} />
                {section.body && <p data-aos="fade-up" className="mt-6 max-w-2xl t-lead text-muted">{paragraphText(section.body)}</p>}
              </div>
            </div>
          </section>
        );
      })}
      {page.disclaimer && <p data-aos="fade" className="container-x py-7 text-sm text-muted">{page.disclaimer}</p>}
      {page.closing && (
        <CtaBand
          id={page.closing.id}
          eyebrow=""
          title={page.closing.title}
          sub={page.closing.sub}
          actions={page.closing.actions && page.closing.actions.map((a) => <ActionButton key={a.label} action={a} />)}
        >

          {page.closing.signoff && <p className="t-eyebrow text-paper/60">{page.closing.signoff}</p>}
        </CtaBand>
      )}
      {legacy && page.cta && <CtaBand eyebrow="Next step" title={patient ? "Let's help you find the right care." : "Let's put the right system behind your team."} actions={<Button href={page.cta.href} variant="dawn">{page.cta.label}</Button>} />}
    </>
  )}</Localized>;
}
