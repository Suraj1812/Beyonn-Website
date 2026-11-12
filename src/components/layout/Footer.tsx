import { Localized } from "@/components/i18n/Localized";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, ChevronDown, Mail, Phone } from "lucide-react";

function Linkedin({ className }: { className?: string }) {
  return <Localized>{(
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z" />
    </svg>
  )}</Localized>;
}
import { footerNav, legalNav, site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return <Localized>{(
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="container-x relative pb-5 pt-6 sm:pb-10 sm:pt-16">
        <div className="grid gap-4 sm:gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div data-aos="fade-up">
            <Link href="/" aria-label="Beyonn home">
              <Logo size="lg" tone="light" className="max-sm:[&>img]:w-32" />
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-snug sm:mt-6 sm:text-xl text-paper/80">
              Beyond Training. Beyond Billing. <em className="serif-em text-breath">Beyond the Appliance.</em>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 text-paper/70 max-sm:text-sm sm:mt-8 sm:grid sm:gap-2">
              <a href={`mailto:${site.email}`} className="flex w-fit items-center gap-2.5 hover:text-paper max-sm:min-h-11 max-sm:gap-1.5">
                <Mail className="size-4" aria-hidden /> <span className="link-u">{site.email}</span>
              </a>
              <a href={site.phoneHref} className="flex w-fit items-center gap-2.5 hover:text-paper max-sm:min-h-11 max-sm:gap-1.5">
                <Phone className="size-4" aria-hidden /> <span className="link-u">{site.phone}</span>
              </a>
            </div>
            <div className="flex flex-wrap gap-2 sm:mt-6">
              <a href={site.linkedin.beyonn} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm hover:border-paper/40 max-sm:min-h-11 max-sm:px-3 max-sm:py-1 max-sm:text-xs">
                <Linkedin className="size-4" aria-hidden /> Beyonn
              </a>
              <a href={site.linkedin.doctor} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm hover:border-paper/40 max-sm:min-h-11 max-sm:px-3 max-sm:py-1 max-sm:text-xs">
                <Linkedin className="size-4" aria-hidden /> Dr. Rodney Willey
              </a>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 sm:gap-10">
            {footerNav.map((col, i) => {
              const links = col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-u text-paper/80 hover:text-paper max-sm:inline-flex max-sm:min-h-11 max-sm:items-center">
                    {l.label}
                  </Link>
                </li>
              ));
              return (
                <div key={col.title} data-aos="fade-up" data-aos-delay={i * 80}>
                  <details className="group border-b border-paper/15 sm:hidden">
                    <summary className="flex min-h-11 cursor-pointer sm:min-h-12 list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
                      {col.title}
                      <ChevronDown className="size-4 text-breath group-open:rotate-180 motion-safe:transition-transform" aria-hidden />
                    </summary>
                    <ul className="mobile-reveal pb-2">{links}</ul>
                  </details>
                  <div className="hidden sm:block">
                    <h2 className="t-eyebrow text-paper/45">{col.title}</h2>
                    <ul className="mt-5 grid gap-3">{links}</ul>
                  </div>
                </div>
              );
            })}
            <div className="mt-3 sm:col-span-3 sm:mt-0" data-aos="fade-up">
              <Link href="/qualify" className="group flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-paper/12 p-3 sm:gap-6 sm:p-6 transition-colors hover:border-dawn/60 hover:bg-paper/[0.03]">
                <span>
                  <span className="t-eyebrow text-breath">For practitioners</span>
                  <span className="block text-sm font-medium sm:mt-2 sm:text-xl">See if your practice qualifies</span>
                </span>
                <span className="grid size-8 flex-none sm:size-12 place-items-center rounded-full bg-dawn text-white transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </div>


        <div className="mt-4 flex flex-col border-t border-paper/10 pt-1 text-xs sm:mt-14 sm:gap-4 sm:pt-8 sm:text-sm text-paper/50 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <span>© 2026 Beyonn</span>
            <a href="#main" className="inline-flex min-h-11 items-center gap-1.5 text-breath sm:hidden">
              Back to top <ArrowUp className="size-4" aria-hidden />
            </a>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-3 gap-y-1 max-sm:pr-12 sm:gap-x-6 sm:gap-y-2">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="link-u hover:text-paper">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )}</Localized>;
}
