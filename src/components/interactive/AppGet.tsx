"use client";

import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { site } from "@/content/site";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";

export type AppScreen = "snore-score" | "sleep-score" | "book-exam" | "find-doctor" | "home";

const screenLabel: Record<AppScreen, string> = {
  "snore-score": "the Snore Score",
  "sleep-score": "the Sleep Score",
  "book-exam": "booking an exam",
  "find-doctor": "finding a Beyonn certified provider",
  home: "the home screen",
};

function platform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * "Download the app" button. Phones go straight to the store; desktop shows a QR code.
 * Until store links are configured, it offers a direct contact route.
 */
export function AppGet({ label, screen = "home", variant = "dawn", className, size = "md" }: { label: string; screen?: AppScreen; variant?: "dawn" | "dark" | "light" | "ghost" | "ghost-light"; className?: string; size?: "md" | "sm" }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const live = Boolean(site.app.appStore || site.app.googlePlay);
  const downloadUrl = site.app.appStore && site.app.googlePlay
    ? `${site.url}/patient-app#download`
    : site.app.googlePlay || site.app.appStore;

  useEffect(() => {
    if (!open || !live) return;
    QRCode.toDataURL(downloadUrl, { margin: 1, width: 360, color: { dark: "#1c395e", light: "#ffffff" } }).then(setQr).catch(() => setQr(""));
  }, [open, live, downloadUrl]);

  const onClick = () => {
    const p = platform();
    if (live && p === "ios" && site.app.appStore) return void (window.location.href = site.app.appStore);
    if (live && p === "android" && site.app.googlePlay) return void (window.location.href = site.app.googlePlay);
    setOpen(true);
  };

  const v = { dawn: "btn--dawn", dark: "", light: "btn--light", ghost: "btn--ghost", "ghost-light": "btn--ghost-light" }[variant];

  return (
    <>
      <button type="button" onClick={onClick} className={cn("btn", v, size === "sm" && "btn--sm", className)}>
        <span>{label}</span>
        <ArrowUpRight aria-hidden />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Get the Beyonn Patient App">
        <span className="grid size-12 place-items-center rounded-2xl bg-ink text-breath">
          <Smartphone className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 t-h3">Get the Beyonn Patient App</h2>
        {live ? (
          <>
            <p className="mt-3 leading-relaxed text-muted">Scan to download the app, then open {screenLabel[screen]}.</p>
            <div className="mt-6 grid place-items-center rounded-3xl bg-white/70 p-6">
              {qr ? <Image src={qr} alt="QR code to download the Beyonn Patient App" width={224} height={224} unoptimized className="size-56" /> : <div className="size-56 animate-pulse rounded-2xl bg-ink/5" />}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {site.app.appStore && (
                <a href={site.app.appStore} className="btn btn--sm" target="_blank" rel="noopener">
                  <span>App Store</span>
                </a>
              )}
              {site.app.googlePlay && (
                <a href={site.app.googlePlay} className="btn btn--sm" target="_blank" rel="noopener">
                  <span>Google Play</span>
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 leading-relaxed text-muted">
              Public App Store and Google Play links have not been confirmed. Ask Beyonn about availability and access to {screenLabel[screen]}.
            </p>
            <a href="mailto:info@beyonn.com?subject=Beyonn%20Patient%20App%20availability" className="btn btn--dawn mt-6"><span>Ask about app access</span><ArrowUpRight aria-hidden /></a>
            <p className="mt-6 text-sm text-muted">
              Want to be seen sooner? <Link href="/patients/find-a-provider" className="font-semibold text-text underline">Find a provider near you</Link>.
            </p>
          </>
        )}
      </Dialog>
    </>
  );
}
