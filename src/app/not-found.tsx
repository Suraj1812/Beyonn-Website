import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: { absolute: "Page not found | Beyonn" }, robots: { index: false } };

const paths = [
  { label: "The Beyonn Protocol", href: "/the-beyonn-system" },
  { label: "Partner With Us", href: "/partner" },
  { label: "For Patients", href: "/patients" },
  { label: "Find a Provider", href: "/patients/find-a-provider" },
];

export default function NotFound() {
  return (
    <section className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-paper px-6 pt-24 text-ink">
      <div className="hero-glow absolute inset-0 opacity-60" aria-hidden />
      <div className="relative max-w-2xl text-center">
        <p className="font-display text-7xl font-bold text-dawn">404</p>
        <h1 className="mt-5 t-h1">
          This page went <em>beyond</em> our map.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted">The link may be old or mistyped. Here are the places most people are looking for.</p>
        <ul className="mx-auto mt-10 grid max-w-md gap-2 text-left">
          {paths.map((p, i) => (
            <li key={p.href} data-aos="fade-up" data-aos-delay={i * 60}>
              <Link href={p.href} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 py-4 transition-colors hover:border-dawn">
                {p.label} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn btn--dawn mt-10">
          <span>Back to home</span>
        </Link>
      </div>
    </section>
  );
}
