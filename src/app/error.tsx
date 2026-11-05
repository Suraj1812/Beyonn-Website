"use client";

import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/content/site";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="grid min-h-[100svh] place-items-center bg-paper px-6 pt-24 text-ink">
      <div data-aos="fade-up" className="max-w-xl text-center">
        <p className="t-eyebrow text-dawn-deep">Something went wrong</p>
        <h1 className="mt-5 t-h1">
          We lost the thread. <em>Let&apos;s pick it back up.</em>
        </h1>
        <p className="mt-6 text-muted">
          Try again, or reach us at {site.email} · {site.phone}.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn--dawn">
            <span>Try again</span>
          </button>
          <Link href="/" className="btn btn--ghost">
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
