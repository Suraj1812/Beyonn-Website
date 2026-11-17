"use client";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AosInit } from "@/components/providers/AosInit";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { VisitorProvider } from "@/components/providers/VisitorProvider";
import { GuideBot } from "@/components/visual/GuideBot";
import { Intro } from "@/components/visual/Intro";
import { ParticleMorph } from "@/components/visual/ParticleMorph";
import { PointerEffects } from "@/components/visual/PointerEffects";
import { ScrollProgress } from "@/components/visual/ScrollProgress";
import type { CmsDocument } from "@/lib/cms/model";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { CmsProvider } from "./CmsProvider";
import { CmsAppearance, CmsSlot } from "./PublicCms";

export function SiteShell({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: CmsDocument;
}) {
  const path = usePathname();
  return (
    <LanguageProvider>
      <CmsProvider initial={initial}>
        {path.startsWith("/control") ? (
          children
        ) : (
          <>
            <CmsAppearance />
            <Intro />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-3"
            >
              Skip to content
            </a>
            <VisitorProvider>
              <SmoothScroll>
                <ScrollProgress />
                <CmsSlot name="header">
                  <Header />
                </CmsSlot>
                <main id="main" tabIndex={-1} className="outline-none">
                  {children}
                </main>
                <CmsSlot name="footer">
                  <Footer />
                </CmsSlot>
                <CmsSlot name="particles">
                  <ParticleMorph />
                </CmsSlot>
                <CmsSlot name="guide">
                  <GuideBot />
                </CmsSlot>
                <AosInit />
                <CmsSlot name="pointer">
                  <PointerEffects />
                </CmsSlot>
              </SmoothScroll>
            </VisitorProvider>
          </>
        )}
      </CmsProvider>
    </LanguageProvider>
  );
}
