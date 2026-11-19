"use client";
import { Fragment, type ReactNode } from "react";
import { Localized } from "@/components/i18n/Localized";
import { builderCss, type BuilderBlock, type BuilderSection } from "@/lib/cms/builder";
import { useCms } from "./CmsProvider";

function Block({ block }: { block: BuilderBlock }) {
  const { mediaUrls } = useCms();
  const src = block.src?.startsWith("cms-media:") ? mediaUrls[block.src.slice(10)] ?? `/api/control/media/${block.src.slice(10)}` : block.src;
  return <Localized>{renderBlock(block, src)}</Localized>;
}
function renderBlock(block: BuilderBlock, src?: string) {
  switch (block.type) {
    case "heading": return <h2 className="t-h2 whitespace-pre-line">{block.text}</h2>;
    case "text": return <p className="t-lead whitespace-pre-line">{block.text}</p>;
    case "list": return <ul data-cms-list-source={block.id} className="list-disc space-y-3 ps-6">{(block.items ?? []).map((item, index) => <li className="whitespace-pre-line" key={index}>{item}</li>)}</ul>;
    case "cards": return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(block.items ?? []).map((item, index) => <div key={index} className="whitespace-pre-line rounded-xl border border-current/15 p-6">{item}</div>)}</div>;
    // Uploaded and HTTPS media are already validated by the CMS. Native elements support both.
    // eslint-disable-next-line @next/next/no-img-element
    case "image": return src ? <img src={src} alt={block.alt ?? ""} className="h-auto max-h-[640px] w-full rounded-xl object-contain" /> : <p className="rounded-xl border border-dashed p-8">Choose an image in the editor.</p>;
    case "video": return src ? <video src={src} aria-label={block.alt || "Video"} controls preload="metadata" className="max-h-[640px] w-full rounded-xl" /> : <p className="rounded-xl border border-dashed p-8">Choose a video in the editor.</p>;
    case "button": return <div><a href={block.href || "#"} className="btn inline-flex rounded-lg bg-dawn px-6 py-3 font-semibold text-white">{block.text}</a></div>;
    case "spacer": return <div aria-hidden="true" style={{ height: 32 }} />;
  }
}
function AddedSection({ section }: { section: BuilderSection }) {
  return <section data-cms-section={section.id} data-cms-section-label={section.label} className="section-y bg-white text-ink">
    <div className="container-x space-y-6" data-cms-blocks>
      {section.blocks.map((block) => <div key={block.id} data-cms-block={block.id}><Block block={block} /></div>)}
    </div>
  </section>;
}

export function BuilderInsertions({ anchor, position }: { anchor: string; position: "before" | "after" }) {
  const { document, pathname } = useCms();
  const sections = document.builder?.[pathname]?.sections ?? [];
  return <>{sections.filter((section) => section.enabled && section.anchor === anchor && section.position === position)
    .map((section) => <AddedSection section={section} key={section.id} />)}</>;
}
export function CmsSection({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <>
    <BuilderInsertions anchor={id} position="before" />
    <div data-cms-section={id} data-cms-section-label={label} className="cms-section-host">{children}</div>
    <BuilderInsertions anchor={id} position="after" />
  </>;
}
export function BuilderCanvas({ children }: { children: ReactNode }) {
  const { document, pathname, editing } = useCms();
  return <Fragment>
    <style>{`.cms-section-host{display:flow-root}.cms-builder-text{white-space:pre-line}${editing ? '.intro{visibility:hidden!important}html{scroll-behavior:auto!important}[data-cms-section]{position:relative}[data-cms-section]:hover{outline:1px dashed #3177bf;outline-offset:-2px}[data-cms-editor-layout-selected]{outline:3px solid #3177bf!important;outline-offset:-3px}' : ''}${builderCss(document.builder?.[pathname])}`}</style>
    <BuilderInsertions anchor="start" position="after" />
    {children}
    <BuilderInsertions anchor="end" position="before" />
  </Fragment>;
}
