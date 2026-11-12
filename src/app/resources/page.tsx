import { Localized } from "@/components/i18n/Localized";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/content/articles";
import { PageHero } from "@/components/sections/PageHero";
import { Tilt } from "@/components/visual/Tilt";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata = pageMeta({ title: "Resources | Beyonn", description: "Practical guides to OSA, TMD, oral appliance therapy, team training and medical billing.", path: "/resources", kicker: "Beyonn Resources" });

export default function ResourcesPage() {
  return <Localized>{<>
    <PageHero eyebrow="Beyonn Resources" title="Knowledge for the practice. Clarity for the patient." sub="Understand the clinical connection and the work around care, one useful guide at a time." />
    <section className="container-x section-y"><div data-morph-shape="rect" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => {
        const patient = article.audience === "patients";
        return (
          <div key={article.slug} data-aos="fade-up" data-aos-delay={Math.min((index % 3) * 80, 240)}>
            <Tilt className="h-full rounded-[var(--radius-card)]" max={5}>
              <Link href={`/resources/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white shadow-[0_18px_40px_-34px_rgb(19_37_62/0.5)]">
                <span className={cn("relative block h-32 overflow-hidden", patient ? "bg-[linear-gradient(135deg,#0b7a60,#13253e)]" : "bg-[linear-gradient(135deg,var(--color-ink),var(--color-night))]")}>
                  <span className="absolute -right-10 -top-6 aspect-[1600/1306] w-56 bg-paper/[0.12] transition-transform duration-700 group-hover:scale-110 [mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat] [-webkit-mask:url(/assets/site/beyonn-emblem.png)_center/contain_no-repeat]" aria-hidden />
                  <span className="absolute bottom-4 left-6 t-eyebrow text-breath">{patient ? "For patients" : "For practitioners"}</span>
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="text-sm text-muted">{article.minutes} min read</span>
                  <span className="mt-2 block t-h3 transition-colors group-hover:text-dawn">{article.title}</span>
                  <span className="mt-3 block leading-relaxed text-muted">{article.excerpt}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-dawn">
                    Read the guide
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </Tilt>
          </div>
        );
      })}
    </div></section>
  </>}</Localized>;
}
