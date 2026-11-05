"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { isPatientRoute } from "@/content/site";
import { cn } from "@/lib/cn";

/** Persistent CTA (doc footer spec): Discovery Call everywhere, Find a Provider on patient pages. */
export function FloatingCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [inCheck, setInCheck] = useState(false);
  const patient = isPatientRoute(pathname);
  const hideOn = ["/qualify", "/portal", "/partner-login"];
  const cta = patient ? { label: "Find a Provider", href: "/patients/find-a-provider" } : { label: "Book Your Discovery Call", href: "/qualify" };

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 900;
      setShow(window.scrollY > window.innerHeight * 0.9 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/patients") return;
    const element = document.getElementById("quick-check");
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInCheck(entry.isIntersecting), { rootMargin: "-96px 0px -48px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  if (hideOn.includes(pathname) || pathname === cta.href || inCheck) return null;

  return (
    <Link
      href={cta.href}
      className={cn(
        "fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-sm font-semibold text-paper shadow-2xl shadow-black/30 ring-1 ring-paper/10 transition-all duration-700 ease-[var(--ease-out-expo)] sm:bottom-6 sm:right-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      {cta.label}
      <span className="grid size-9 place-items-center rounded-full bg-dawn text-white">
        <ArrowUpRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
