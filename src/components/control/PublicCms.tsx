"use client";
import { ContentSection } from "@/components/sections/ContentSection";
import type { PageSection } from "@/content/pages";
import { defaultTheme } from "@/lib/cms/model";
import { usePathname } from "next/navigation";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { useCms } from "./CmsProvider";

export function CmsHomeLayout({ children }: { children: ReactNode }) {
  const { document } = useCms();
  const originals = new Map(
    Children.toArray(children)
      .filter(isValidElement)
      .map((child) => [String(child.key).replace(/^[.$]+/, ""), child]),
  );
  return (
    <>
      {document.home
        .filter((block) => block.enabled)
        .map((block, index) => (
          <Fragment key={`${block.id}-${index}`}>
            {block.section ? (
              <ContentSection
                section={block.section as PageSection}
                index={index}
              />
            ) : (
              originals.get(block.id.split("~")[0])
            )}
          </Fragment>
        ))}
    </>
  );
}
export function CmsSlot({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const { document } = useCms();
  return document.components[name] === false ? null : <>{children}</>;
}
const font = (name: string) =>
  name === "Montserrat"
    ? "var(--font-montserrat), sans-serif"
    : name === "Inter"
      ? "var(--font-inter), sans-serif"
      : name === "Georgia"
        ? "Georgia, serif"
        : "system-ui, sans-serif";
export function CmsAppearance() {
  const { document, preview } = useCms();
  const path = usePathname();
  const t = document.theme;
  if (path.startsWith("/control")) return null;
  const changed = JSON.stringify(t) !== JSON.stringify(defaultTheme);
  return (
    <>
      {changed && (
        <style>{`:root{--color-dawn:${t.primary};--color-dawn-deep:${t.primary};--color-ink:${t.secondary};--color-night:${t.secondary};--color-breath:${t.accent};--color-paper:${t.background};--color-paper-2:${t.surface};--color-text:${t.text};--color-muted:${t.muted};--radius-card:${t.radius}px;--radius-panel:${t.radius}px;--section-y:clamp(2.5rem,5vw,${t.spacing}px);--font-sans:${font(t.bodyFont)};--font-display:${font(t.headingFont)}}html{font-size:${t.fontSize}px}body{font-family:${font(t.bodyFont)}}main h1,main h2,main h3{color:${t.heading}}main .text-paper h1,main .text-paper h2,main .text-paper h3{color:inherit}.btn{border-radius:${t.buttonRadius}px;padding-inline:${t.buttonPadding}px}header.fixed>div{background-color:${t.headerBackground}}footer{background-color:${t.footerBackground}}${t.shadow ? "" : 'main [class*="shadow"]{box-shadow:none}'}`}</style>
      )}
      {t.gradient?.enabled && (
        <style>{`main [data-cms-hero],main [data-guide="hero"]{background:linear-gradient(${t.gradient.angle}deg,${t.gradient.from},${t.gradient.to})}`}</style>
      )}
      {preview && (
        <div
          className="fixed bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg"
          translate="no"
        >
          Draft preview · only visible here
        </div>
      )}
    </>
  );
}
