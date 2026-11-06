import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";

function Linkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z" />
    </svg>
  );
}
import { footerNav, legalNav, site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="container-x relative pt-16 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div data-aos="fade-up">
            <Link href="/" aria-label="Beyonn home">
              <Logo size="lg" tone="light" />
            </Link>
            <p className="mt-6 max-w-sm text-xl leading-snug text-paper/80">
              Beyond Training. Beyond Billing. <em className="serif-em text-breath">Beyond the Appliance.</em>
            </p>
            <div className="mt-8 grid gap-2 text-paper/70">
              <a href={`mailto:${site.email}`} className="flex w-fit items-center gap-2.5 hover:text-paper">
                <Mail className="size-4" aria-hidden /> <span className="link-u">{site.email}</span>
              </a>
              <a href={site.phoneHref} className="flex w-fit items-center gap-2.5 hover:text-paper">
                <Phone className="size-4" aria-hidden /> <span className="link-u">{site.phone}</span>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={site.linkedin.beyonn} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm hover:border-paper/40">
                <Linkedin className="size-4" aria-hidden /> Beyonn
              </a>
              <a href={site.linkedin.doctor} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm hover:border-paper/40">
                <Linkedin className="size-4" aria-hidden /> Dr. Rodney Willey
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {footerNav.map((col, i) => (
              <div key={col.title} data-aos="fade-up" data-aos-delay={i * 80}>
                <h2 className="t-eyebrow text-paper/45">{col.title}</h2>
                <ul className="mt-5 grid gap-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-u text-paper/80 hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3" data-aos="fade-up">
              <Link href="/qualify" className="group flex items-center justify-between gap-6 rounded-[var(--radius-card)] border border-paper/12 p-6 transition-colors hover:border-dawn/60 hover:bg-paper/[0.03]">
                <span>
                  <span className="t-eyebrow text-breath">For practitioners</span>
                  <span className="mt-2 block text-xl font-medium">See if your practice qualifies</span>
                </span>
                <span className="grid size-12 flex-none place-items-center rounded-full bg-dawn text-white transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </div>


        <div className="mt-14 flex flex-col gap-4 border-t border-paper/10 pt-8 text-sm text-paper/50 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Beyonn</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="link-u hover:text-paper">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
