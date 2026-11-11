"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Earth,
  GraduationCap,
  HeartPulse,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Stethoscope,
  UserRound,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { isGroup, isPatientRoute, primaryNav, signInNav, site, type NavGroup, type NavLink } from "@/content/site";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

const icons: Record<string, LucideIcon> = {
  "/the-beyonn-system": Workflow,
  "/academy": GraduationCap,
  "/patient-app": Smartphone,
  "/patient-app#download": Smartphone,
  "/global": Earth,
  "/dr-rodney-willey": Stethoscope,
  "/team": Users,
  "/workshop": CalendarDays,
  "/contact": Mail,
  "/patients": Activity,
  "/patients/find-a-provider": MapPin,
  "/portal": HeartPulse,
  "/partner-login": KeyRound,
};

const signInGroup: NavGroup = { label: "Sign in", links: signInNav };

/** Exact page match for a link (hash links never count as the current page). */
const isCurrent = (pathname: string, href: string) => !href.includes("#") && pathname === href;
/** True when the page is this link's page or one beneath it. */
const isUnder = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
/** A group is active when the current page lives under one of its links. */
const groupActive = (pathname: string, group: NavGroup) =>
  group.links.some(({ href }) => !href.includes("#") && isUnder(pathname, href));

function MenuLink({ link, pathname, onNavigate }: { link: NavLink; pathname: string; onNavigate?: () => void }) {
  const Icon = icons[link.href] ?? ArrowRight;
  const current = isCurrent(pathname, link.href);
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn("group/item flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-ink/[0.05]", current && "bg-ink/[0.05]")}
    >
      <span className="grid size-10 flex-none place-items-center rounded-xl bg-ink/[0.05] text-dawn-deep ring-1 ring-inset ring-ink/10 transition-colors duration-300 group-hover/item:bg-dawn group-hover/item:text-ink">
        <Icon className="size-[1.1rem]" aria-hidden />
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="flex items-center gap-2 text-[0.95rem] font-semibold leading-tight">
          {link.label}
          {current && <span className="rounded-full bg-dawn/15 px-1.5 py-px text-[0.65rem] font-bold uppercase tracking-wider text-dawn-deep">Here</span>}
        </span>
        {link.description && <span className="mt-1 block text-[0.83rem] leading-snug text-muted">{link.description}</span>}
      </span>
    </Link>
  );
}

type MenuProps = {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onOpen: () => void;
  onClose: (immediate?: boolean) => void;
  onToggle: () => void;
  align?: "center" | "right";
  trigger?: React.ReactNode;
  triggerLabel?: string;
};

/** Short intros shown on the left of the full-width "mega" menu. */
const groupIntro: Record<string, string> = {
  "The Program": "Everything your team needs to add and run OSA + TMD care.",
};

/** One row in a desktop menu: small accent icon, label, one-line description. */
function PanelLink({ link, pathname, onNavigate, compact }: { link: NavLink; pathname: string; onNavigate: () => void; compact?: boolean }) {
  const Icon = icons[link.href] ?? ArrowRight;
  const current = isCurrent(pathname, link.href);
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(
        "group/item relative flex items-start gap-3 rounded-xl transition-colors duration-200 hover:bg-paper-2/70",
        compact ? "px-3 py-2.5" : "p-3.5",
        current && "bg-paper-2/70",
      )}
    >
      <Icon className="mt-0.5 size-[1.1rem] flex-none text-dawn-deep" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[0.95rem] font-semibold leading-tight">
          {link.label}
          <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" aria-hidden />
        </span>
        {link.description && <span className="mt-1 block text-[0.85rem] leading-snug text-muted">{link.description}</span>}
      </span>
    </Link>
  );
}

/**
 * Desktop dropdown: opens on hover with a mouse, on click/tap or Enter otherwise.
 * Groups with a footer (The Program) open as a full-width sheet joined to the bar;
 * the rest open as a compact list under their trigger.
 */
function DesktopMenu({ group, pathname, open, onOpen, onClose, onToggle, align = "center", trigger, triggerLabel }: MenuProps) {
  const pointer = useRef("");
  const id = `menu-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
  const active = groupActive(pathname, group);
  const mega = !!group.footer;
  const done = () => onClose(true);

  return (
    <li
      className={mega ? "static" : "relative"}
      onPointerEnter={(e) => e.pointerType === "mouse" && onOpen()}
      onPointerLeave={(e) => e.pointerType === "mouse" && onClose()}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onClose(true);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={triggerLabel}
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        onClick={() => {
          // A mouse already opened it on hover; a click should not snap it shut.
          const mouse = pointer.current === "mouse";
          pointer.current = "";
          if (mouse && open) return;
          onToggle();
        }}
        className={cn(
          "relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[0.9rem] font-medium transition-colors duration-300 xl:px-3.5",
          open ? "bg-ink/[0.06] text-ink" : active ? "text-ink" : "text-ink/75 hover:bg-ink/[0.05] hover:text-ink",
        )}
      >
        {trigger ?? group.label}
        <ChevronDown className={cn("size-3.5 opacity-70 transition-transform duration-300", open && "rotate-180")} aria-hidden />
        {active && <span className="absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full bg-dawn" aria-hidden />}
      </button>

      {mega ? (
        <div
          id={id}
          className={cn(
            "absolute inset-x-0 top-full transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out-expo)]",
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="border-y border-ink/[0.08] bg-paper shadow-[0_28px_50px_-30px_rgb(19_37_62/0.4)]">
            <div className="container-x grid grid-cols-[14rem_1fr_18rem] gap-8 py-7 xl:grid-cols-[16rem_1fr_20rem] xl:gap-12">
              <div className="flex flex-col pt-3.5">
                <p className="font-display text-xl font-semibold tracking-tight">{group.label}</p>
                {groupIntro[group.label] && <p className="mt-2 text-sm leading-relaxed text-muted">{groupIntro[group.label]}</p>}
                {group.footer && (
                  <Link href={group.footer.href} onClick={done} className="group/foot mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-dawn-deep">
                    {group.footer.label}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover/foot:translate-x-1" aria-hidden />
                  </Link>
                )}
              </div>
              <ul className="grid grid-cols-2 content-start gap-1 border-l border-ink/[0.08] pl-6 xl:pl-8">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <PanelLink link={l} pathname={pathname} onNavigate={done} />
                  </li>
                ))}
              </ul>
              <Link href="/workshop#register" onClick={done} className="group/card flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink/[0.07] transition-shadow duration-300 hover:shadow-[0_18px_36px_-24px_rgb(19_37_62/0.45)]">
                <span className="relative block aspect-video bg-breath/40">
                  <Image src="/assets/site/platform-coaching.png" alt="" fill sizes="20rem" className="object-contain" />
                </span>
                <span className="flex flex-1 flex-col px-4 py-3.5">
                  <span className="text-xs font-semibold text-dawn-deep">Free workshop</span>
                  <span className="mt-1 font-semibold leading-snug">One live hour with Dr. Rodney Willey</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted transition-colors group-hover/card:text-ink">
                    Ask for the next date
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/card:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div
          id={id}
          className={cn(
            "absolute top-full pt-2.5 transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-out-expo)]",
            align === "right" ? "right-0" : "left-0",
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
          )}
        >
          <ul className="w-[19rem] rounded-2xl border border-ink/[0.08] bg-paper p-1.5 text-ink shadow-[0_24px_44px_-24px_rgb(19_37_62/0.4)]">
            {group.links.map((l) => (
              <li key={l.href}>
                <PanelLink link={l} pathname={pathname} onNavigate={done} compact />
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const lastY = useRef(0);
  const closeTimer = useRef<number | undefined>(undefined);
  const headerRef = useRef<HTMLElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const patient = isPatientRoute(pathname);
  const cta = patient
    ? { label: "Find a Provider", short: "Find a provider", href: "/patients/find-a-provider" }
    : { label: "Book a Discovery Call", short: "Book a call", href: "/qualify" };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      if (y < 480 || y < lastY.current - 4) setHidden(false);
      else if (y > lastY.current + 4) setHidden(true);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI state when the route changes
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Lock page scroll while the drawer is open, and move focus in and out of it.
  useEffect(() => {
    if (mobileOpen) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      const t = window.setTimeout(() => closeBtn.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    lenis?.start();
    document.documentElement.style.overflow = "";
  }, [mobileOpen, lenis]);

  // Escape closes everything; a tap outside the header closes a desktop dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen((was) => {
        if (was) menuBtn.current?.focus();
        return false;
      });
    };
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const openNow = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeSoon = (immediate?: boolean) => {
    window.clearTimeout(closeTimer.current);
    if (immediate) setOpenMenu(null);
    else closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };
  const openDrawer = () => {
    const here = primaryNav.find((item) => isGroup(item) && groupActive(pathname, item));
    setExpanded(here ? here.label : (primaryNav.find(isGroup)?.label ?? null));
    setMobileOpen(true);
  };
  const closeDrawer = () => {
    setMobileOpen(false);
    menuBtn.current?.focus();
  };

  const audiences = [
    { label: "Practitioner", href: "/", on: !patient },
    { label: "Patient", href: "/patients", on: patient },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 text-ink transition-transform duration-500 ease-[var(--ease-out-expo)]",
          hidden && openMenu === null && !mobileOpen ? "-translate-y-full" : scrolled ? "md:-translate-y-9" : "translate-y-0",
        )}
      >
        {/* Utility strip: audience switch, workshop, phone. Tucks away once the page scrolls. */}
        <div className="hidden h-9 bg-ink text-paper md:block">
          <div className="container-x flex h-full items-center justify-between text-[0.8rem]">
            <nav aria-label="Choose your path" className="flex items-center gap-1">
              <span className="mr-1.5 text-paper/45">I&apos;m a</span>
              {audiences.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  aria-current={a.on ? "true" : undefined}
                  className={cn("rounded-full px-2.5 py-0.5 font-medium transition-colors", a.on ? "bg-paper/10 text-paper" : "text-paper/55 hover:text-paper")}
                >
                  {a.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-6 text-paper/60">
              <Link href="/workshop#register" className="group hidden items-center gap-2 transition-colors hover:text-paper lg:inline-flex">
                Join a Workshop
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>

            </div>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={cn(
            "relative border-b border-ink/10 bg-paper transition-shadow duration-500",
            (scrolled || mobileOpen || openMenu !== null) && "shadow-[0_10px_30px_-18px_rgb(19_37_62/0.35)]",
          )}
        >
          <div className="container-x flex h-16 items-center gap-6 lg:h-[4.5rem]">
            <Link href="/" aria-label="Beyonn home" className="shrink-0 rounded-md">
              <Logo tone="plain" size="nav" priority />
            </Link>

            <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-0.5">
                {primaryNav.map((item) =>
                  isGroup(item) ? (
                    <DesktopMenu
                      key={item.label}
                      group={item}
                      pathname={pathname}
                      open={openMenu === item.label}
                      onOpen={() => openNow(item.label)}
                      onClose={(now) => closeSoon(now)}
                      onToggle={() => (openMenu === item.label ? setOpenMenu(null) : openNow(item.label))}
                    />
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                        className={cn(
                          "relative block whitespace-nowrap rounded-full px-3 py-2 text-[0.9rem] font-medium transition-colors duration-300 xl:px-3.5",
                          isUnder(pathname, item.href) ? "text-ink" : "text-ink/75 hover:bg-ink/[0.05] hover:text-ink",
                        )}
                      >
                        {item.label}
                        {isUnder(pathname, item.href) && <span className="absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full bg-dawn" aria-hidden />}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <ul className="hidden lg:block">
                <DesktopMenu
                  group={signInGroup}
                  pathname={pathname}
                  open={openMenu === "signin"}
                  onOpen={() => openNow("signin")}
                  onClose={(now) => closeSoon(now)}
                  onToggle={() => (openMenu === "signin" ? setOpenMenu(null) : openNow("signin"))}
                  align="right"
                  triggerLabel="Sign in"
                  trigger={
                    <>
                      <UserRound className="size-[1.05rem] xl:hidden" aria-hidden />
                      <span className="hidden xl:inline">Sign in</span>
                    </>
                  }
                />
              </ul>
              <span className="hidden h-6 w-px bg-ink/15 lg:block" aria-hidden />
              <Link href={cta.href} data-magnetic="" className="btn btn--dawn btn--sm !px-4 max-[359px]:hidden sm:!px-5">
                <span className="xl:hidden">{cta.short}</span>
                <span className="hidden xl:inline">{cta.label}</span>
                <ArrowUpRight className="hidden sm:block" aria-hidden />
              </Link>
              <button
                ref={menuBtn}
                type="button"
                onClick={() => (mobileOpen ? closeDrawer() : openDrawer())}
                className="flex h-11 items-center gap-2.5 rounded-full border border-ink/15 px-3 transition-colors hover:bg-ink/[0.06] sm:px-4 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <span className="hidden text-sm font-medium sm:inline">Menu</span>
                <span className="relative block h-3 w-[1.15rem]" aria-hidden>
                  <span className="absolute left-0 top-0 h-[2px] w-full rounded-full bg-ink" />
                  <span className="absolute bottom-0 right-0 h-[2px] w-2/3 rounded-full bg-ink" />
                </span>
              </button>
            </div>
          </div>
        </div>
        <nav aria-label="Choose your audience" className="grid grid-cols-2 border-b border-ink/10 bg-paper md:hidden">
          {audiences.map((audience) => <Link key={audience.label} href={audience.href} aria-current={audience.on ? "page" : undefined} className={cn("flex min-h-11 items-center justify-center border-t-2 px-2 text-xs font-semibold transition-colors", audience.on ? "border-dawn bg-paper-2 text-dawn-deep" : "border-transparent text-muted hover:bg-paper-2")}>For {audience.label === "Practitioner" ? "Practitioners" : "Patients"}</Link>)}
        </nav>
      </header>

      {/* Tablet + mobile drawer */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden", !mobileOpen && "pointer-events-none")} inert={!mobileOpen}>
        <div
          onClick={closeDrawer}
          className={cn("absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500", mobileOpen ? "opacity-100" : "opacity-0")}
          aria-hidden
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full flex-col bg-paper text-ink shadow-2xl shadow-ink/20 transition-transform duration-500 ease-[var(--ease-out-expo)] sm:w-[27rem] sm:border-l sm:border-ink/10",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="container-x flex h-16 flex-none items-center justify-between border-b border-ink/10 sm:!px-6">
            <Link href="/" aria-label="Beyonn home" onClick={() => setMobileOpen(false)}>
              <Logo tone="plain" size="nav" />
            </Link>
            <button
              ref={closeBtn}
              type="button"
              onClick={closeDrawer}
              className="grid size-11 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink/[0.06]"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="container-x flex-1 overflow-y-auto overscroll-contain pb-8 pt-5 sm:!px-6" data-lenis-prevent>
            <div className="grid grid-cols-2 rounded-full bg-ink/[0.05] p-1 text-sm font-semibold" role="group" aria-label="Choose your path">
              {audiences.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  aria-current={a.on ? "true" : undefined}
                  className={cn("rounded-full py-2.5 text-center transition-colors", a.on ? "bg-ink text-paper" : "text-ink/65 hover:text-ink")}
                >
                  For {a.label === "Practitioner" ? "Practitioners" : "Patients"}
                </Link>
              ))}
            </div>

            <nav aria-label="Mobile" className="mt-4">
              <ul>
                {primaryNav.map((item, i) => {
                  const style = { transitionDelay: mobileOpen ? `${120 + i * 45}ms` : "0ms" };
                  const reveal = cn("border-b border-ink/10 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]", mobileOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0");
                  if (!isGroup(item)) {
                    const here = isUnder(pathname, item.href);
                    return (
                      <li key={item.href} className={reveal} style={style}>
                        <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined} className="flex items-center justify-between py-4 text-lg font-medium">
                          <span className="flex items-center gap-2.5">
                            {item.label}
                            {here && <span className="text-sm font-semibold text-dawn-deep">You&apos;re here</span>}
                          </span>
                          <ArrowRight className="size-4 text-ink/40" aria-hidden />
                        </Link>
                      </li>
                    );
                  }
                  const isOpen = expanded === item.label;
                  const panel = `m-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <li key={item.label} className={reveal} style={style}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        aria-controls={panel}
                        className="flex w-full items-center justify-between py-4 text-left text-lg font-medium"
                      >
                        <span className="flex items-center gap-2.5">
                          {item.label}
                          {groupActive(pathname, item) && <span className="text-sm font-semibold text-dawn-deep">You&apos;re here</span>}
                        </span>
                        <span className={cn("grid size-8 place-items-center rounded-full transition-colors", isOpen ? "bg-ink/[0.06]" : "")}>
                          <ChevronDown className={cn("size-4 transition-transform duration-300", isOpen && "rotate-180")} aria-hidden />
                        </span>
                      </button>
                      <div id={panel} inert={!isOpen} className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                        <div className="overflow-hidden">
                          <ul className="-mx-3 grid gap-0.5 pb-4">
                            {item.links.map((l) => (
                              <li key={l.href}>
                                <MenuLink link={l} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                              </li>
                            ))}
                            {item.footer && (
                              <li className="px-3 pt-2">
                                <Link href={item.footer.href} onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-dawn-deep">
                                  {item.footer.label}
                                  <ArrowRight className="size-4" aria-hidden />
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={cn("mt-8 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]", mobileOpen ? "translate-y-0 opacity-100 delay-300" : "translate-y-3 opacity-0")}>
              <p className="t-eyebrow text-muted">Sign in</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {signInNav.map((l) => {
                  const Icon = icons[l.href] ?? UserRound;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-4 transition-colors hover:border-ink/25 hover:bg-ink/[0.05]"
                    >
                      <Icon className="size-5 text-dawn-deep" aria-hidden />
                      <span>
                        <span className="block text-sm font-semibold">{l.label}</span>
                        {l.description && <span className="mt-1 block text-xs leading-snug text-muted">{l.description}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="container-x flex-none border-t border-ink/10 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:!px-6">
            <Link href={cta.href} onClick={() => setMobileOpen(false)} className="btn btn--dawn w-full">
              <span>{cta.label}</span>
              <ArrowUpRight aria-hidden />
            </Link>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-sm font-medium">
              <a href={site.phoneHref} className="flex items-center justify-center gap-2 rounded-full border border-ink/15 py-2.5 transition-colors hover:bg-ink/[0.06]">
                <Phone className="size-4" aria-hidden />
                Call us
              </a>
              <a href={`mailto:${site.email}`} className="flex items-center justify-center gap-2 rounded-full border border-ink/15 py-2.5 transition-colors hover:bg-ink/[0.06]">
                <Mail className="size-4" aria-hidden />
                Email us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
