"use client";
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import type { CmsDocument, Json, MediaAsset } from "@/lib/cms/model";
import { safeUrl } from "@/lib/cms/model";
import { repository } from "@/lib/cms/storage";
import { builderIdPattern, type BoxStyle, type BuilderBlock, type BuilderPage, type BuilderSection, type ElementStyle } from "@/lib/cms/builder";

const label = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
const uid = () => crypto.randomUUID();
export function elementSelector(element: Element): string | undefined {
  const main = element.closest("#main");
  if (!main || element === main) return;
  const parts: string[] = [];
  let node: Element | null = element;
  while (node && node !== main) {
    const section = node.getAttribute("data-cms-section");
    if (section && builderIdPattern.test(section)) {
      parts.unshift(`[data-cms-section="${section}"]`);
      return parts.join(" > ");
    }
    const siblings: Element[] = Array.from(node.parentElement?.children ?? []).filter((child) => child.tagName === node!.tagName);
    parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(node) + 1})`);
    node = node.parentElement;
  }
  return parts.join(" > ");
}
function Field({ name, children }: { name: string; children: ReactNode }) {
  return <label className="ctl-field"><span>{name}</span>{Children.map(children, (child) => isValidElement(child) && ["input", "textarea", "select"].includes(String(child.type)) ? cloneElement(child as ReactElement<{ "aria-label"?: string }>, { "aria-label": name }) : child)}</label>;
}
function Rows({ values, change, noun = "item" }: { values: string[]; change: (values: string[]) => void; noun?: string }) {
  return <div className="ctl-builder-rows">{values.map((value, index) => <div className="ctl-builder-row" key={index}>
    <textarea aria-label={`${label(noun)} ${index + 1}`} rows={2} value={value} onChange={(event) => change(values.map((item, i) => i === index ? event.target.value : item))} />
    <div className="ctl-builder-icon-actions">
      <button type="button" className="ctl-button" aria-label={`Move ${noun} ${index + 1} up`} disabled={!index} onClick={() => { const next = [...values]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; change(next); }}><ArrowUp size={14} /></button>
      <button type="button" className="ctl-button" aria-label={`Remove ${noun} ${index + 1}`} onClick={() => change(values.filter((_, i) => i !== index))}><Trash2 size={14} /></button>
    </div>
  </div>)}<button type="button" className="ctl-button" onClick={() => change([...values, `New ${noun}`])}><Plus size={14} /> Add {noun}</button></div>;
}

export function BuilderPanel({ draft, path, update, frameDocument, selected, select, tab, setTab }: {
  draft: CmsDocument; path: string; update: (doc: CmsDocument) => void;
  tab: string; setTab: (tab: string) => void;
  frameDocument: Document | null; selected?: Element; select: (element: Element | undefined) => void;
}) {
  const [sections, setSections] = useState<{ id: string; label: string; element: Element }[]>([]);
  const [editingSection, setEditingSection] = useState<string>();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [template, setTemplate] = useState("text");
  const [anchor, setAnchor] = useState("end");
  const [position, setPosition] = useState<"before" | "after">("before");
  const page = draft.builder?.[path] ?? {};
  const selector = selected && elementSelector(selected);
  const style = selector ? page.styles?.[selector]?.[device] ?? {} : {};
  const custom = page.sections?.find((section) => section.id === editingSection);
  const selectedList = selected?.closest("[data-cms-list]") ?? selected?.querySelector("[data-cms-list]");
  const listId = selectedList?.getAttribute("data-cms-list");

  useEffect(() => {
    if (!frameDocument) return;
    const scan = () => setSections(Array.from(frameDocument.querySelectorAll("#main [data-cms-section]")).map((element) => ({ id: element.getAttribute("data-cms-section")!, label: element.getAttribute("data-cms-section-label") || "Section", element })));
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(frameDocument.getElementById("main") ?? frameDocument.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [frameDocument]);

  function changePage(next: BuilderPage) { update({ ...draft, builder: { ...draft.builder, [path]: next } }); }
  function changeStyle(next: BoxStyle) {
    if (!selector) return;
    changePage({ ...page, styles: { ...page.styles, [selector]: { ...page.styles?.[selector], [device]: next } } });
  }
  function changeSection(next: BuilderSection, asset?: MediaAsset) { update({ ...draft, ...(asset ? { media: [...draft.media, asset] } : {}), builder: { ...draft.builder, [path]: { ...page, sections: page.sections?.map((section) => section.id === next.id ? next : section) } } }); }
  function removeSection(section: BuilderSection) {
    changePage({ ...page, sections: page.sections?.filter((item) => item.id !== section.id) });
    setEditingSection(undefined);
  }
  function addSection() {
    const id = `section-${uid()}`;
    const heading: BuilderBlock = { id: uid(), type: "heading", text: "Your section heading" };
    const text: BuilderBlock = { id: uid(), type: "text", text: "Add your text here. Use a new line for each paragraph." };
    const content: BuilderBlock = template === "text" ? text : template === "image" ? { id: uid(), type: "image", text: "", src: "", alt: "" } : template === "cards" ? { id: uid(), type: "cards", text: "", items: ["First card", "Second card", "Third card"] } : template === "list" ? { id: uid(), type: "list", text: "", items: ["First item", "Second item"] } : { id: uid(), type: "button", text: "Get in touch", href: "/contact" };
    const section: BuilderSection = { id, label: `New ${template} section`, anchor, position: anchor === "start" ? "after" : anchor === "end" ? "before" : position, enabled: true, blocks: [heading, content] };
    changePage({ ...page, sections: [...(page.sections ?? []), section] });
    setEditingSection(id);
  }
  const selectElement = (element: Element) => { select(element); element.scrollIntoView({ block: "center", behavior: "instant" }); setTab("style"); };

  return <aside className="ctl-visual-inspector ctl-builder-panel" aria-label="Page builder">
    <div className="ctl-builder-tabs" role="group" aria-label="Page builder tools">
      {[["sections", "Sections"], ["style", "Design"], ["content", "Content"]].map(([id, name]) => <button className="ctl-button" type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{name}</button>)}
    </div>
    <p className="ctl-builder-help">Click anything in the preview to design it. Changes stay private until you publish.</p>
    {tab === "sections" && <>
      <h2>Page sections</h2>
      <div className="ctl-builder-section-list">{sections.map((section) => <div className="ctl-builder-section-row" key={section.id}>
        <button type="button" className="ctl-button" onClick={() => selectElement(section.element.classList.contains("cms-section-host") ? section.element.querySelector(":scope > section, :scope > header, :scope > article") ?? section.element.firstElementChild ?? section.element : section.element)}>{section.label}</button>
        {page.sections?.some((item) => item.id === section.id) && <button type="button" className="ctl-button" aria-label={`Edit ${section.label}`} onClick={() => setEditingSection(section.id)}>Edit</button>}
      </div>)}</div>
      {page.sections?.filter((section) => !section.enabled).map((section) => <button type="button" className="ctl-button" key={section.id} onClick={() => setEditingSection(section.id)}>Edit hidden {section.label}</button>)}
      <details className="ctl-builder-group" open><summary>Add a section</summary>
        <Field name="Section layout"><select value={template} onChange={(event) => setTemplate(event.target.value)}><option value="text">Heading and text</option><option value="image">Image with heading</option><option value="list">List</option><option value="cards">Cards</option><option value="button">Call to action</option></select></Field>
        <Field name="Insert at"><select value={anchor} onChange={(event) => setAnchor(event.target.value)}><option value="start">Start of page</option><option value="end">End of page</option>{sections.filter((section) => !page.sections?.some((item) => item.id === section.id)).map((section) => <option value={section.id} key={section.id}>{section.label}</option>)}</select></Field>
        {!["start", "end"].includes(anchor) && <Field name="Position"><select value={position} onChange={(event) => setPosition(event.target.value as "before" | "after")}><option value="before">Before section</option><option value="after">After section</option></select></Field>}
        <button className="ctl-button ctl-primary" type="button" onClick={addSection}><Plus size={15} /> Add section</button>
      </details>
      {custom && <div className="ctl-builder-group"><SectionEditor section={custom} draft={draft} change={changeSection} />
        <div className="ctl-builder-icon-actions">
          <button className="ctl-button" type="button" onClick={() => changeSection({ ...custom, enabled: !custom.enabled })}>{custom.enabled ? "Hide section" : "Show section"}</button>
          <button className="ctl-button" type="button" onClick={() => (() => { const id = `section-${uid()}`; const styles = { ...page.styles }; for (const [selector, style] of Object.entries(page.styles ?? {})) if (selector.startsWith(`[data-cms-section="${custom.id}"]`)) styles[selector.replace(custom.id, id)] = structuredClone(style); changePage({ ...page, styles, sections: [...(page.sections ?? []), { ...structuredClone(custom), id, label: `${custom.label} copy`, blocks: custom.blocks.map((block) => ({ ...block, id: uid() })) }] }); })()}><Copy size={14} /> Duplicate</button>
          <button className="ctl-button" type="button" onClick={() => removeSection(custom)}><Trash2 size={14} /> Delete section</button>
        </div>
        <Field name="Section location"><select value={`${custom.anchor}|${custom.position}`} onChange={(event) => { const [anchor, position] = event.target.value.split("|"); changeSection({ ...custom, anchor, position: position as "before" | "after" }); }}><option value="start|after">Start of page</option><option value="end|before">End of page</option>{sections.filter((item) => !page.sections?.some((section) => section.id === item.id)).flatMap((item) => [<option key={`${item.id}-before`} value={`${item.id}|before`}>Before {item.label}</option>, <option key={`${item.id}-after`} value={`${item.id}|after`}>After {item.label}</option>])}</select></Field>
        <div className="ctl-builder-icon-actions"><button type="button" className="ctl-button" onClick={() => { const items = [...(page.sections ?? [])]; const i = items.findIndex((item) => item.id === custom.id); if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; changePage({ ...page, sections: items }); } }}><ArrowUp size={14} /> Move up</button><button type="button" className="ctl-button" onClick={() => { const items = [...(page.sections ?? [])]; const i = items.findIndex((item) => item.id === custom.id); if (i < items.length - 1) { [items[i + 1], items[i]] = [items[i], items[i + 1]]; changePage({ ...page, sections: items }); } }}><ArrowDown size={14} /> Move down</button></div>
      </div>}
      <ExistingSections draft={draft} path={path} update={update} />
    </>}
    {tab === "style" && <>
      <h2>Design selected element</h2>
      {!selector ? <p>Choose a section above, or click an element in the preview.</p> : <>
        <p className="ctl-visual-target">{selected?.tagName.toLowerCase()} · {selected?.textContent?.slice(0, 70)}</p>
        <button type="button" className="ctl-button" disabled={!selected?.parentElement?.closest("#main") || selected.parentElement.id === "main"} onClick={() => selected?.parentElement && select(selected.parentElement)}>Select parent container</button>
        <div className="ctl-builder-tabs" role="group" aria-label="Design screen size">{(["desktop", "mobile"] as const).map((value) => <button className="ctl-button" type="button" aria-pressed={device === value} key={value} onClick={() => setDevice(value)}>{label(value)}</button>)}</div>
        <p className="ctl-builder-help">{device === "mobile" ? "Mobile overrides apply at 640px and below. Blank values inherit desktop." : "Desktop settings apply to all sizes unless a mobile override is set."}</p>
        <StyleFields style={style} change={changeStyle} />
        <button className="ctl-button" type="button" onClick={() => { const styles = { ...page.styles }; const next: ElementStyle = { ...styles[selector] }; delete next[device]; if (Object.keys(next).length) styles[selector] = next; else delete styles[selector]; changePage({ ...page, styles }); }}>Reset {device} design</button>
        {listId && <details className="ctl-builder-group" open><summary>Add list items</summary><p className="ctl-builder-help">Existing items can be edited in the text editor. Add extra items here.</p><Rows values={page.lists?.[listId] ?? []} change={(items) => changePage({ ...page, lists: { ...page.lists, [listId]: items } })} /></details>}
      </>}
    </>}
    {tab === "content" && <ContentCollections draft={draft} path={path} update={update} />}
  </aside>;
}

function StyleFields({ style, change }: { style: BoxStyle; change: (style: BoxStyle) => void }) {
  const gradient = style.gradient;
  return <>
    <details className="ctl-builder-group" open><summary>Background and color</summary>
      <Field name="Background type"><select value={gradient ? "gradient" : style.background ? "solid" : "original"} onChange={(event) => { const next = { ...style }; delete next.gradient; delete next.background; if (event.target.value === "solid") next.background = "#ffffff"; if (event.target.value === "gradient") next.gradient = { from: "#1c395e", to: "#3177bf", angle: 135 }; change(next); }}><option value="original">Original background</option><option value="solid">Solid color</option><option value="gradient">Gradient</option></select></Field>
      {style.background && <Field name="Background color"><input type="color" value={style.background} onChange={(event) => change({ ...style, background: event.target.value })} /></Field>}
      {gradient && <><div className="ctl-builder-grid"><Field name="Gradient start"><input type="color" value={gradient.from} onChange={(event) => change({ ...style, gradient: { ...gradient, from: event.target.value } })} /></Field><Field name="Gradient end"><input type="color" value={gradient.to} onChange={(event) => change({ ...style, gradient: { ...gradient, to: event.target.value } })} /></Field></div><Field name="Gradient angle"><input type="range" min={0} max={360} value={gradient.angle} onChange={(event) => change({ ...style, gradient: { ...gradient, angle: Number(event.target.value) } })} /><output>{gradient.angle}°</output></Field><div className="ctl-builder-swatches">{[["#1c395e", "#3177bf"], ["#72cfb7", "#f2f7fd"], ["#13253e", "#1c395e"]].map(([from, to], i) => <button key={from} type="button" aria-label={`Gradient preset ${i + 1}`} style={{ background: `linear-gradient(135deg,${from},${to})` }} onClick={() => change({ ...style, gradient: { from, to, angle: 135 } })} />)}</div></>}
      <Field name="Text color"><input type="color" value={style.color ?? "#1c395e"} onChange={(event) => change({ ...style, color: event.target.value })} /></Field>
    </details>
    <details className="ctl-builder-group" open><summary>Spacing</summary>
      {(["padding", "margin"] as const).map((type) => <fieldset key={type}><legend>{type === "padding" ? "Space inside (px)" : "Space outside (px)"}</legend><div className="ctl-builder-grid">{(["Top", "Right", "Bottom", "Left"] as const).map((side) => { const key = `${type}${side}` as keyof BoxStyle; return <Field key={side} name={`${label(type)} ${side.toLowerCase()}`}><input type="number" min={0} max={320} placeholder="Original" value={typeof style[key] === "number" ? String(style[key]) : ""} onChange={(event) => { const next = { ...style }; if (event.target.value === "") delete next[key]; else Object.assign(next, { [key]: Math.min(320, Math.max(0, Number(event.target.value))) }); change(next); }} /></Field>; })}</div></fieldset>)}
    </details>
    <details className="ctl-builder-group"><summary>Layout and visibility</summary>
      {([['gap', 'Item spacing', 320], ['maxWidth', 'Maximum width', 2400], ['borderRadius', 'Corner radius', 320]] as const).map(([key, name, max]) => <Field name={`${name} (px)`} key={key}><input type="number" min={0} max={max} placeholder="Original" value={style[key] ?? ""} onChange={(event) => { const next = { ...style }; if (!event.target.value) delete next[key]; else next[key] = Math.min(max, Math.max(0, Number(event.target.value))); change(next); }} /></Field>)}
      <Field name="Text alignment"><select value={style.textAlign ?? ""} onChange={(event) => { const next = { ...style }; if (event.target.value) next.textAlign = event.target.value as BoxStyle["textAlign"]; else delete next.textAlign; change(next); }}><option value="">Original</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
      <label className="ctl-builder-check"><input type="checkbox" checked={style.hidden ?? false} onChange={(event) => { const next = { ...style }; next.hidden = event.target.checked; change(next); }} /> Hide on this screen size</label>
    </details>
  </>;
}

function SectionEditor({ section, draft, change }: { section: BuilderSection; draft: CmsDocument; change: (section: BuilderSection, asset?: MediaAsset) => void }) {
  const latest = useRef({ section, change });
  const mounted = useRef(true);
  useEffect(() => { latest.current = { section, change }; }, [section, change]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [newType, setNewType] = useState<BuilderBlock["type"]>("text");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const updateBlock = (block: BuilderBlock) => change({ ...section, blocks: section.blocks.map((item) => item.id === block.id ? block : item) });
  async function upload(file: File, block: BuilderBlock) {
    const accepts = block.type === "video" ? ["video/mp4", "video/webm"] : ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!accepts.includes(file.type) || file.size > 20 * 1024 * 1024) { setUploadError("Choose a supported file up to 20 MB."); return; }
    setUploading(true); setUploadError("");
    try {
      const id = uid(); await repository.putMedia(id, file);
      // One update includes both the asset and section so batched React updates cannot drop either.
      if (!mounted.current) return;
      const current = latest.current;
      current.change({ ...current.section, blocks: current.section.blocks.map((item) => item.id === block.id ? { ...item, src: `cms-media:${id}`, alt: item.alt || file.name } : item) }, { id, name: file.name, alt: file.name, description: "", size: file.size, type: file.type, createdAt: new Date().toISOString() });
    } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again."); } finally { setUploading(false); }
  }
  return <>
    <h2>Edit new section</h2><Field name="Section name"><input value={section.label} onChange={(event) => change({ ...section, label: event.target.value })} /></Field>
    {section.blocks.map((block, index) => <details className="ctl-builder-group" key={block.id} open><summary>{label(block.type)} {index + 1}</summary>
      {["heading", "text", "button"].includes(block.type) && <Field name={`${label(block.type)} content`}><textarea rows={3} value={block.text} onChange={(event) => updateBlock({ ...block, text: event.target.value })} /></Field>}
      {["list", "cards"].includes(block.type) && <Rows noun={block.type === "cards" ? "card" : "list item"} values={block.items ?? []} change={(items) => updateBlock({ ...block, items })} />}
      {["image", "video"].includes(block.type) && <>
        <Field name={`${label(block.type)} URL`}><input value={block.src ?? ""} onChange={(event) => updateBlock({ ...block, src: event.target.value })} /></Field>
        {block.src && !safeUrl(block.src, true) && <p className="ctl-error">Use a local path or HTTPS URL.</p>}
        <Field name="Media library"><select value={draft.media.some((asset) => `cms-media:${asset.id}` === block.src) ? block.src : ""} onChange={(event) => { const asset = draft.media.find((asset) => `cms-media:${asset.id}` === event.target.value); if (asset) updateBlock({ ...block, src: `cms-media:${asset.id}`, alt: asset.alt }); }}><option value="">Choose existing media</option>{draft.media.filter((asset) => asset.type.startsWith(block.type === "image" ? "image/" : "video/")).map((asset) => <option key={asset.id} value={`cms-media:${asset.id}`}>{asset.name}</option>)}</select></Field>
        <Field name={`Upload ${block.type}`}><input type="file" disabled={uploading} accept={block.type === "video" ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, block); }} /></Field>
        <Field name="Media description"><input value={block.alt ?? ""} onChange={(event) => updateBlock({ ...block, alt: event.target.value })} /></Field>
      </>}
      {block.type === "button" && <><Field name="Button destination"><input value={block.href ?? ""} onChange={(event) => updateBlock({ ...block, href: event.target.value })} /></Field>{block.href && !safeUrl(block.href) && <p className="ctl-error">Use a local path, anchor or HTTPS URL.</p>}</>}
      <div className="ctl-builder-icon-actions"><button type="button" className="ctl-button" aria-label={`Move block ${index + 1} up`} disabled={!index} onClick={() => { const blocks = [...section.blocks]; [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; change({ ...section, blocks }); }}><ArrowUp size={14} /></button><button type="button" className="ctl-button" aria-label={`Duplicate block ${index + 1}`} onClick={() => { const blocks = [...section.blocks]; blocks.splice(index + 1, 0, { ...structuredClone(block), id: uid() }); change({ ...section, blocks }); }}><Copy size={14} /></button><button type="button" className="ctl-button" aria-label={`Remove block ${index + 1}`} onClick={() => change({ ...section, blocks: section.blocks.filter((item) => item.id !== block.id) })}><Trash2 size={14} /></button></div>
    </details>)}
    {uploading && <p role="status">Uploading…</p>}{uploadError && <p role="alert" className="ctl-error">{uploadError}</p>}
    <Field name="Content block type"><select value={newType} onChange={(event) => setNewType(event.target.value as BuilderBlock["type"])}>{["heading", "text", "list", "cards", "image", "video", "button", "spacer"].map((type) => <option key={type} value={type}>{label(type)}</option>)}</select></Field>
    <button type="button" className="ctl-button" onClick={() => change({ ...section, blocks: [...section.blocks, { id: uid(), type: newType, text: newType === "heading" ? "New heading" : newType === "button" ? "Learn more" : "New text", ...(["list", "cards"].includes(newType) ? { items: ["New item"] } : {}), ...(newType === "button" ? { href: "/" } : {}) }] })}><Plus size={14} /> Add content block</button>
  </>;
}

function ExistingSections({ draft, path, update }: { draft: CmsDocument; path: string; update: (draft: CmsDocument) => void }) {
  const contentPage = (draft.data.pages as Record<string, { sections: { title?: string; eyebrow?: string; enabled?: boolean }[] }>)[path.slice(1)];
  const items = path === "/" ? draft.home : contentPage?.sections;
  if (!items) return null;
  function modify(index: number, action: "up" | "down" | "hide") {
    const next = structuredClone(draft);
    const array = path === "/" ? next.home : (next.data.pages as Record<string, { sections: { enabled?: boolean }[] }>)[path.slice(1)].sections;
    if (action === "hide") array[index].enabled = array[index].enabled === false;
    else { const other = index + (action === "up" ? -1 : 1); [array[index], array[other]] = [array[other], array[index]]; }
    // Index-addressed styles/insertions follow their sections when existing page sections move.
    if (path !== "/" && action !== "hide") {
      const other = index + (action === "up" ? -1 : 1);
      const config = next.builder?.[path];
      if (config) {
        const swap = (key: string) => key === `section-${index}` ? `section-${other}` : key === `section-${other}` ? `section-${index}` : key;
        config.sections = config.sections?.map((section) => ({ ...section, anchor: swap(section.anchor) }));
        config.styles = Object.fromEntries(Object.entries(config.styles ?? {}).map(([selector, style]) => [selector.replace(/\[data-cms-section="(section-[0-9]+)"\]/, (_, id) => `[data-cms-section="${swap(id)}"]`), style]));
      }
    }
    update(next);
  }
  return <details className="ctl-builder-group"><summary>Reorder or hide existing sections</summary>{items.map((item, index) => <div className="ctl-builder-existing" key={index}><span>{"label" in item ? item.label : item.title ?? item.eyebrow ?? `Section ${index + 1}`}</span><div className="ctl-builder-icon-actions"><button type="button" className="ctl-button" aria-label={`Move section ${index + 1} up`} disabled={!index} onClick={() => modify(index, "up")}><ArrowUp size={14} /></button><button type="button" className="ctl-button" aria-label={`Move section ${index + 1} down`} disabled={index === items.length - 1} onClick={() => modify(index, "down")}><ArrowDown size={14} /></button><button type="button" className="ctl-button" onClick={() => modify(index, "hide")}>{item.enabled === false ? "Show" : "Hide"}</button></div></div>)}</details>;
}

function ContentCollections({ draft, path, update }: { draft: CmsDocument; path: string; update: (draft: CmsDocument) => void }) {
  const hasPage = Boolean((draft.data.pages as Record<string, Json>)[path.slice(1)]);
  const [collection, setCollection] = useState(hasPage ? "current-page" : "workshopContent");
  const source = collection === "current-page" ? (draft.data.pages as Record<string, Json>)[path.slice(1)] : draft.data[collection];
  function change(value: Json) {
    const next = structuredClone(draft);
    if (collection === "current-page") (next.data.pages as Record<string, Json>)[path.slice(1)] = value;
    else next.data[collection] = value;
    update(next);
  }
  return <><h2>Page content and lists</h2><p className="ctl-builder-help">Expand a group to edit it. Add, move or remove list entries, cards, buttons and paragraphs without code.</p><Field name="Content collection"><select value={collection} onChange={(event) => setCollection(event.target.value)}>{hasPage && <option value="current-page">This page</option>}{Object.keys(draft.data).filter((key) => key !== "pages").map((key) => <option key={key} value={key}>{label(key)}</option>)}</select></Field>{source !== undefined && <JsonFields key={collection} name={collection === "current-page" ? "This page" : label(collection)} value={source} change={change} />}</>;
}
function JsonFields({ name, value, change, depth = 0 }: { name: string; value: Json; change: (value: Json) => void; depth?: number }) {
  if (depth > 12 || value === null) return null;
  if (typeof value === "string") return <Field name={name}><textarea rows={value.length > 100 ? 4 : 2} value={value} onChange={(event) => change(event.target.value)} /></Field>;
  if (typeof value === "boolean") return <label className="ctl-builder-check"><input type="checkbox" checked={value} onChange={(event) => change(event.target.checked)} />{name}</label>;
  if (typeof value === "number") return <Field name={name}><input type="number" value={value} onChange={(event) => change(Number(event.target.value))} /></Field>;
  if (Array.isArray(value)) {
    const seed: Json = structuredClone(value[0] ?? (/sections?/i.test(name) ? { id: `section-${uid()}`, title: "New section", body: "New text" } : /cards?|steps?/i.test(name) ? { title: "New item", text: "New text" } : /actions?|links?/i.test(name) ? { label: "New link", href: "/" } : /faq/i.test(name) ? { q: "New question", a: "New answer" } : "New item"));
    if (seed && !Array.isArray(seed) && typeof seed === "object") {
      if (typeof seed.title === "string") seed.title = `New ${name.toLowerCase().replace(/s$/, "")} ${value.length + 1}`;
      if (typeof seed.id === "string") seed.id = `item-${uid()}`;
      if (typeof seed.slug === "string") seed.slug = `new-item-${uid().slice(0, 8)}`;
    }
    return <details className="ctl-builder-group"><summary>{name} ({value.length})</summary>{value.map((item, index) => <div className="ctl-builder-entry" key={index}><JsonFields name={`${name} ${index + 1}`} value={item} change={(next) => change(value.map((old, i) => i === index ? next : old))} depth={depth + 1} /><div className="ctl-builder-icon-actions"><button type="button" className="ctl-button" aria-label={`Move ${name} ${index + 1} up`} disabled={!index} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; change(next); }}><ArrowUp size={14} /></button><button type="button" className="ctl-button" aria-label={`Remove ${name} ${index + 1}`} onClick={() => change(value.filter((_, i) => i !== index))}><Trash2 size={14} /></button></div></div>)}<button type="button" className="ctl-button" onClick={() => change([...value, structuredClone(seed)])}><Plus size={14} /> Add {name.replace(/s$/, "")}</button></details>;
  }
  return <details className="ctl-builder-group" open={depth === 0}><summary>{name}</summary>{Object.entries(value).filter(([key]) => !["id", "widget", "variant", "app"].includes(key)).map(([key, child]) => <JsonFields key={key} name={label(key)} value={child} change={(next) => change({ ...value, [key]: next })} depth={depth + 1} />)}</details>;
}
