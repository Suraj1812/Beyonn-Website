import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { Ladder, certificationTiers } from "@/components/sections/Ladder";
import { academyFaq, globalFaq, partnerFaq, patientFaq, systemFaq } from "@/content/faqs";
import { pages } from "@/content/pages";
import { team } from "@/content/team";
import { PatientCheck } from "@/components/interactive/PatientCheck";
import { pageMeta } from "@/lib/seo";
import { Parallax } from "@/components/visual/Parallax";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { Tilt } from "@/components/visual/Tilt";
import { FeatureCards } from "@/components/sections/FeatureCards";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return Object.keys(pages).map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const key = (await params).slug.join("/");
  const page = pages[key];
  if (!page) return {};
  return pageMeta({
    title: `${page.title} | Beyonn`,
    description: page.description,
    path: `/${key}`,
    kicker: page.eyebrow,
    noindex: NOINDEX.includes(key),
  });
}

const NOINDEX = ["portal", "partner-login", "privacy", "terms", "hipaa"];

const faqs = { "the-beyonn-system": systemFaq, academy: academyFaq, partner: partnerFaq, global: globalFaq, patients: patientFaq };

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
  const faq = faqs[key as keyof typeof faqs];
  const patient = key.startsWith("patients") || key === "patient-app" || key === "portal";

  const crumbs = key.split("/").map((_, i, parts) => {
    const k = parts.slice(0, i + 1).join("/");
    return { "@type": "ListItem", position: i + 2, name: pages[k]?.title ?? parts[i], item: `${site.url}/${k}` };
  });
  const faqText = faq?.filter((f) => typeof f.a === "string");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site.url }, ...crumbs],
        }}
      />
      {faqText && faqText.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqText.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        sub={page.description}
        photo={page.photo ? { src: page.photo, alt: page.photoAlt ?? page.title, mode: key === "dr-rodney-willey" ? "contain" : "cover", caption: key === "dr-rodney-willey" ? { name: "Dr. Rodney Willey", role: "DDS, D.ACSDD, D.ASBA" } : undefined } : undefined}
        actions={page.cta && <Button href={page.cta.href} variant="dawn">{page.cta.label}</Button>}
      />
      {page.sections.map((section, index) => {
        const tone = index % 2 === 0 ? "bg-paper" : "bg-paper-2";
        const flip = index % 2 === 1;

        // Photo + copy, with the points as feature cards underneath.
        if (section.image) {
          return (
            <section key={section.title} id={section.id} className={`section-y ${tone}`}>
              <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
                <div className={flip ? "lg:order-2" : ""}>
                  <SectionHeading eyebrow={section.eyebrow} title={section.title} />
                  {section.body && <p data-aos="fade-up" className="mt-7 max-w-2xl t-lead text-muted">{section.body}</p>}
                </div>
                <Parallax speed={0.05} className={flip ? "lg:order-1" : ""}>
                  <Tilt className="rounded-[var(--radius-panel)]" max={4}>
                    <div data-aos="reveal" data-aos-duration="1200" className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)] bg-paper-2 shadow-[0_30px_60px_-38px_rgb(19_37_62/0.55)]">
                      <Image src={section.image} alt={section.imageAlt ?? section.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
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
              <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeading eyebrow={section.eyebrow} title={section.title} />
                  {section.body && <p data-aos="fade-up" className="mt-7 max-w-xl t-lead text-muted">{section.body}</p>}
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
              <div className={`relative isolate overflow-hidden rounded-[var(--radius-panel)] border border-ink/10 px-6 py-14 sm:px-14 sm:py-20 ${index % 2 === 0 ? "bg-paper-2" : "bg-white"}`}>
                <div className="pointer-events-none absolute -bottom-24 -right-20 -z-10 aspect-[1600/1306] w-[30rem] bg-dawn/[0.08] [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] sm:w-[40rem]" aria-hidden />
                <SectionHeading eyebrow={section.eyebrow} title={section.title} />
                {section.body && <p data-aos="fade-up" className="mt-6 max-w-2xl t-lead text-muted">{section.body}</p>}
              </div>
            </div>
          </section>
        );
      })}
      {key === "team" && <section className="section-y bg-paper-2"><div className="container-x"><SectionHeading eyebrow="Our people" title="The team behind your team." /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{team.map((person, i) => <div key={person.name} data-aos="fade-up" data-aos-delay={(i % 4) * 70}><Tilt className="h-full rounded-[var(--radius-card)]"><article className="h-full overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]"><div className="relative aspect-[4/5] bg-breath/40"><Image src={person.image} alt={person.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-contain object-bottom" /></div><div className="p-6"><h3 className="t-h3">{person.name}</h3><p className="mt-2 text-sm text-muted">{person.role}</p></div></article></Tilt></div>)}</div></div></section>}
      {key === "patients" && <PatientCheck />}
      {(key === "academy" || key === "partner") && (
        <section className="spotlight section-y relative overflow-hidden bg-ink text-paper"><div className="container-x"><SectionHeading tone="dark" eyebrow="Certification" title="A path that grows with your practice." /><div className="mt-12"><Ladder tiers={certificationTiers.academy} tone="dark" /></div></div></section>
      )}
      {faq && <section id="faq" className="section-y bg-paper"><div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]"><div className="lg:sticky lg:top-28 lg:self-start"><SectionHeading eyebrow="Questions" title="Answers before the next step." /></div><Faq items={faq} /></div></section>}
      {key === "patients" && <p data-aos="fade" className="container-x py-7 text-sm text-muted">For general education only. This information is not a medical diagnosis or medical advice. Speak with a qualified provider about your symptoms.</p>}
      {page.cta && <CtaBand eyebrow="Next step" title={patient ? "Let's help you find the right care." : "Let's put the right system behind your team."} actions={<Button href={page.cta.href} variant="dawn">{page.cta.label}</Button>} />}
    </>
  );
}
