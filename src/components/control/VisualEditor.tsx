"use client";

import { ChevronDown, ExternalLink, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { normalize, safeUrl, type CmsDocument, type MediaAsset } from "@/lib/cms/model";
import { BuilderPanel } from "./BuilderPanel";
import { repository } from "@/lib/cms/storage";
import {
  EDITOR_DOCUMENT,
  EDITOR_READY,
  pageOverrideKey,
  loadingTextSource,
  textSize,
  type TextFormat,
  type TextRange,
  type VisualKind,
} from "@/lib/cms/visual";

type Target = {
  kind: VisualKind;
  element: Element;
  source: string;
  label: string;
  color: string;
  size: number;
  video: boolean;
  range?: TextRange;
};

const labels = { text: "Text", media: "Media", link: "Link" };
const marker = (kind: VisualKind) => `data-cms-edit-${kind}`;
const targetKey = (target: Target) => `${target.kind}:${target.source}`;
const selectionKey = (target: Target) => `${targetKey(target)}:${target.range?.start ?? ""}:${target.range?.end ?? ""}`;
const textBlock = `:is(h1,h2,h3,h4,h5,h6,p,blockquote)[${marker("text")}]`;

function pick(element: Element, kind: VisualKind): Target {
  const source = element.getAttribute(marker(kind)) ?? "";
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const rgb = /^rgba?\(/.test(style?.color ?? "") ? style?.color.match(/\d+/g)?.slice(0, 3) : undefined;
  return {
    kind, source, element,
    label: (kind === "media"
      ? element.getAttribute("alt") || element.getAttribute("title") || source.split("/").at(-1)
      : element.textContent?.trim()) || source,
    color: rgb?.length === 3 ? `#${rgb.map((n) => Number(n).toString(16).padStart(2, "0")).join("")}` : "#1c395e",
    size: Math.min(textSize.max, Math.max(textSize.min, Math.round(parseFloat(style?.fontSize || "16")))),
    video: ["VIDEO", "IFRAME", "SOURCE"].includes(element.tagName) || /\.(mp4|webm)(\?|$)/i.test(source),
  };
}

function highlightedText(frame: Document): Target | undefined {
  const selection = frame.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const common = range.commonAncestorContainer;
  const host = (common.nodeType === 1 ? common as Element : common.parentElement)
    ?.closest(`[${marker("text")}]`);
  const original = normalize(range.toString());
  if (!host || !original) return;
  const before = frame.createRange();
  before.selectNodeContents(host);
  before.setEnd(range.startContainer, range.startOffset);
  const leading = /^\s*/.exec(range.toString())?.[0] ?? "";
  const prefix = before.toString() + leading;
  const start = normalize(prefix).length + (normalize(prefix) && /\s$/.test(prefix) ? 1 : 0);
  if (normalize(host.textContent ?? "").slice(start, start + original.length) !== original) return;
  return { ...pick(host, "text"), label: original, range: { start, end: start + original.length, original } };
}

export function VisualEditor({
  draft, path, pages, selectPage, update, onInteraction,
}: {
  draft: CmsDocument;
  path: string;
  pages: { path: string; label: string }[];
  selectPage: (path: string) => void;
  update: (draft: CmsDocument) => void;
  onInteraction: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const inspector = useRef<HTMLElement>(null);
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const [builderTab, setBuilderTab] = useState("sections");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [layoutElement, setLayoutElement] = useState<Element>();
  const [viewport, setViewport] = useState("desktop");
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<{ targets: Target[]; active: VisualKind }>();
  const selected = selection?.targets.find(({ kind }) => kind === selection.active);

  useEffect(() => {
    const receive = (event: MessageEvent<{ type: string }>) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === EDITOR_READY) {
        // The editor is usable as soon as it hydrates, even while images or
        // embedded media keep the frame's load event pending.
        setFrameDocument(frame.current?.contentDocument ?? null);
        setReady(true);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({ type: EDITOR_DOCUMENT, document: draft }, location.origin);
  }, [draft, ready]);

  useEffect(() => {
    if (!frameDocument) return;
    const frame = frameDocument;
    function handleHighlight(endpoint?: Element) {
      const selected = highlightedText(frame);
      if (!selected || (endpoint && !selected.element.contains(endpoint))) return false;
      onInteraction();
      setSelection({ targets: [selected], active: "text" });
      return true;
    }
    function clearHighlight() {
      frame.getSelection()?.removeAllRanges();
    }
    function finishHighlight(event: MouseEvent | KeyboardEvent) {
      if ("key" in event && !event.shiftKey) return;
      handleHighlight();
    }
    function choose(event: MouseEvent | KeyboardEvent) {
      if ("button" in event && event.button !== 0) return;
      if ("key" in event && event.key === "Escape") {
        clearHighlight();
        setSelection(undefined);
        return;
      }
      if ("key" in event && event.key !== "Enter") return;
      const target = event.target as Element | null;
      if (target?.nodeType !== 1) return;
      onInteraction();
      if (builderOpen && target.closest("#main")) {
        event.preventDefault(); event.stopPropagation();
        setLayoutElement(target);
        setBuilderTab("style");
        return;
      }
      if ("button" in event && handleHighlight(target)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      clearHighlight();

      const savedRange = target.closest("[data-cms-selected-range]");
      const host = savedRange?.closest(`[${marker("text")}]`);
      if (savedRange && host) {
        const range = JSON.parse(savedRange.getAttribute("data-cms-selected-range") ?? "null") as TextRange | null;
        if (range) {
          event.preventDefault();
          event.stopPropagation();
          setSelection({ targets: [{ ...pick(host, "text"), label: range.text ?? range.original, range }], active: "text" });
          return;
        }
      }

      const media = target.closest(`[${marker("media")}]`) ??
        target.querySelector(`:scope > iframe[${marker("media")}]`);
      const link = target.closest(`[${marker("link")}]`);
      const linkLabels = Array.from(link?.querySelectorAll(`[${marker("text")}]`) ?? [])
        .filter((element) => element.getClientRects().length);
      const nearbyText = target.closest(`[${marker("text")}]`);
      const block = target.closest(textBlock);
      const part = target.closest("[data-cms-edit-part]");
      const differentlyColored = nearbyText && block && nearbyText !== block &&
        frameDocument?.defaultView?.getComputedStyle(nearbyText).color !== frameDocument?.defaultView?.getComputedStyle(block).color;
      const text = link
        ? nearbyText && link.contains(nearbyText) ? nearbyText : linkLabels.length === 1 ? linkLabels[0] : null
        : part ?? (differentlyColored ? nearbyText : block ?? nearbyText);
      const first = media ?? text ?? link;
      if (first) {
        event.preventDefault();
        event.stopPropagation();
        const targets: Target[] = [];
        if (media) targets.push(pick(media, "media"));
        if (text && !media) targets.push(pick(text, "text"));
        if (link) targets.push(pick(link, "link"));
        setSelection({ targets, active: media ? "media" : link ? "link" : "text" });
        return;
      }
      setSelection(undefined);
      // The editing preview never follows a live link or submits a form.
      if (target.closest("a, button, form")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    frameDocument.addEventListener("click", choose, true);
    frameDocument.addEventListener("keydown", choose, true);
    frameDocument.addEventListener("pointerdown", clearHighlight, true);
    frameDocument.addEventListener("mouseup", finishHighlight);
    frameDocument.addEventListener("keyup", finishHighlight);
    return () => {
      frameDocument.removeEventListener("click", choose, true);
      frameDocument.removeEventListener("keydown", choose, true);
      frameDocument.removeEventListener("pointerdown", clearHighlight, true);
      frameDocument.removeEventListener("mouseup", finishHighlight);
      frameDocument.removeEventListener("keyup", finishHighlight);
    };
  }, [frameDocument, onInteraction, builderOpen]);

  useEffect(() => {
    if (!selected) return;
    const attr = marker(selected.kind);
    const direct = selected.element;
    const element = direct?.isConnected && direct.getAttribute(attr) === selected.source
      ? direct
      : Array.from(frameDocument?.querySelectorAll(`[${attr}]`) ?? [])
        .find((item) => item.getAttribute(attr) === selected.source && item.getClientRects().length);
    element?.setAttribute("data-cms-editor-selected", "");
    return () => element?.removeAttribute("data-cms-editor-selected");
  }, [draft, frameDocument, selected]);

  useEffect(() => {
    if (selection && matchMedia("(max-width: 1024px)").matches)
      inspector.current?.scrollIntoView({ block: "nearest" });
  }, [selection]);

  useEffect(() => {
    if (!builderOpen || !layoutElement?.isConnected) return;
    layoutElement.setAttribute("data-cms-editor-layout-selected", "");
    return () => layoutElement.removeAttribute("data-cms-editor-layout-selected");
  }, [builderOpen, layoutElement, draft]);

  return (
    <div className="ctl-visual">
      <div className="ctl-visual-bar">
        <PagePicker pages={pages} path={path} selectPage={selectPage} />
        <div className="ctl-builder-tabs" role="group" aria-label="Editing mode">
          <button type="button" className="ctl-button" aria-pressed={!builderOpen} onClick={() => setBuilderOpen(false)}>Edit text & media</button>
          <button type="button" className="ctl-button" aria-pressed={builderOpen} onClick={() => setBuilderOpen(true)}>Design & sections</button>
        </div>
        <label className="ctl-field"><span>Preview size</span><select aria-label="Preview size" value={viewport} onChange={(event) => setViewport(event.target.value)}><option value="desktop">Desktop</option><option value="mobile">Mobile · 390px</option></select></label>
        <a className="ctl-button ctl-small" href={path} target="_blank" rel="noopener noreferrer">
          Open live page <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        ref={frame}
        className={`ctl-visual-preview ${viewport === "mobile" ? "ctl-preview-mobile" : ""}`}
        title="Editable website preview"
        src={`${path}?cms-preview=1&cms-edit=1`}
        onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
      />
      {builderOpen && <BuilderPanel draft={draft} path={path} update={update} frameDocument={frameDocument} tab={builderTab} setTab={setBuilderTab} selected={layoutElement} select={setLayoutElement} />}
      {!builderOpen && !selection && <aside className="ctl-visual-inspector ctl-editing-help" aria-label="Editing help">
        <h2>Click to edit</h2><p>Choose any text, button, image or video in the preview to change it.</p>
        <p>Use <strong>Design & sections</strong> to change backgrounds, adjust spacing or add content.</p>
      </aside>}
      {!builderOpen && selection && selected && (
        <aside ref={inspector} className="ctl-visual-inspector" aria-label="Edit selected content"
          onKeyDown={(event) => { if (event.key === "Escape") setSelection(undefined); }}>
          <div className="ctl-visual-selection">
            <h2>{selected.range ? "Edit selected words" : selected.kind === "media" ? (selected.video ? "Edit video" : "Edit image") : `Edit ${selected.kind}`}</h2>
            <button type="button" className="ctl-visual-close" aria-label="Close editor"
              onClick={() => setSelection(undefined)}><X size={18} aria-hidden="true" /></button>
          </div>
          <p className="ctl-visual-target" title={selected.label}>{selected.label}</p>
          {selection.targets.some(({ kind }) => kind === "media") && selection.targets.length > 1 && (
            <div className="ctl-visual-kinds" role="group" aria-label="Options for selected item">
              {selection.targets.map(({ kind }) => (
                <button key={kind} type="button" aria-pressed={kind === selection.active}
                  onClick={() => setSelection({ ...selection, active: kind })}>{labels[kind]}</button>
              ))}
            </div>
          )}
          <EditTarget key={selectionKey(selected)} target={selected} path={path} draft={draft} update={update}
            linkedText={selected.kind === "link" ? selection.targets.find(({ kind }) => kind === "text") : undefined} />
        </aside>
      )}
    </div>
  );
}

function PagePicker({ pages, path, selectPage }: {
  pages: { path: string; label: string }[];
  path: string;
  selectPage: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const current = pages.find((page) => page.path === path)?.label ?? path;
  return (
    <div className="ctl-page-picker" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        trigger.current?.focus();
        setOpen(false);
      }
    }}>
      <span className="ctl-picker-label">Page</span>
      <button ref={trigger} type="button" className="ctl-picker-trigger" aria-label={`Page: ${current}`}
        aria-expanded={open} aria-controls="ctl-page-options" onClick={() => setOpen(!open)}>
        <span>{current}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id="ctl-page-options" className="ctl-page-options" role="group" aria-label="Website pages" hidden={!open}>
        {pages.map((page) => (
          <button key={page.path} type="button" aria-current={page.path === path ? "page" : undefined}
            onClick={() => { trigger.current?.focus(); setOpen(false); selectPage(page.path); }}>{page.label}</button>
        ))}
      </div>
    </div>
  );
}

function EditTarget({ target, path, draft, update, linkedText }: {
  target: Target;
  linkedText?: Target;
  path: string;
  draft: CmsDocument;
  update: (draft: CmsDocument) => void;
}) {
  const key = pageOverrideKey(path, target.kind, target.source);
  const altKey = pageOverrideKey(path, "text", `media-alt:${target.source}`);
  const inherited = draft.overrides[targetKey(target)] ?? target.source;
  const range = target.range;
  const rangeMatch = (item: TextRange) => item.start === range?.start && item.end === range?.end && item.original === range.original;
  const pageRange = range && draft.textRanges?.[key]?.find(rangeMatch);
  const sharedRange = range && draft.textRanges?.[targetKey(target)]?.find(rangeMatch);
  const [globalScope, setGlobalScope] = useState(Boolean(sharedRange && !pageRange));
  const rangeKey = globalScope ? targetKey(target) : key;
  const savedRange = globalScope ? sharedRange : pageRange;
  const [value, setValue] = useState(range ? (pageRange ?? sharedRange)?.text ?? range.original : draft.overrides[key] ?? inherited);
  const [alt, setAlt] = useState(draft.overrides[altKey] ?? "");
  const textTarget = target.kind === "text" ? target : linkedText;
  const formatKey = textTarget ? pageOverrideKey(path, "text", textTarget.source) : key;
  const loadingSource = textTarget?.element.getAttribute("data-cms-loading-label");
  const loadingKey = loadingSource ? pageOverrideKey(path, "text", loadingTextSource(loadingSource)) : undefined;
  const [loadingText, setLoadingText] = useState(loadingKey ? draft.overrides[loadingKey] ?? "" : "");
  const inheritedLabel = linkedText ? draft.overrides[targetKey(linkedText)] ?? linkedText.source : "";
  const [label, setLabel] = useState(draft.overrides[formatKey] ?? inheritedLabel);
  const [format, setFormat] = useState<TextFormat>((range ? pageRange ?? sharedRange : draft.textFormats?.[formatKey]) ?? {});
  const [asset, setAsset] = useState<MediaAsset>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const accepts = target.video ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif";

  async function upload(file: File) {
    if (!accepts.split(",").includes(file.type) || file.size > 20 * 1024 * 1024) {
      setMessage(`Choose a supported ${target.video ? "video" : "image"} up to 20 MB.`);
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const id = crypto.randomUUID();
      await repository.putMedia(id, file);
      const name = file.name.replace(/\.[^.]+$/, "");
      setAsset({ id, name: file.name, type: file.type, size: file.size, alt: name, description: "", createdAt: new Date().toISOString() });
      setValue(`cms-media:${id}`);
      if (!alt) setAlt(name);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function saveRange(item?: TextRange) {
    const textRanges = { ...draft.textRanges };
    const previous = textRanges[rangeKey] ?? [];
    const next = item
      ? [...previous.filter((entry) => entry.end <= item.start || entry.start >= item.end), item]
        .sort((a, b) => a.start - b.start)
      : previous.filter((entry) => !rangeMatch(entry));
    if (next.length) textRanges[rangeKey] = next;
    else delete textRanges[rangeKey];
    update({ ...draft, textRanges });
    target.element.ownerDocument.getSelection()?.removeAllRanges();
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (range) {
      const { color, hoverColor, size } = format;
      const text = value === range.original ? undefined : value;
      saveRange(color || hoverColor || size || text !== undefined
        ? { start: range.start, end: range.end, original: range.original, text, color, hoverColor, size }
        : undefined);
      setMessage("Applied to the preview.");
      return;
    }
    const next = target.kind === "text" ? value : value.trim();
    if (target.kind !== "text" && !safeUrl(next, target.kind === "media")) {
      setMessage("Enter a valid HTTPS URL or website path.");
      return;
    }
    const overrides = { ...draft.overrides };
    const textFormats = { ...draft.textFormats };
    if (next === inherited) delete overrides[key];
    else overrides[key] = next;
    if (linkedText) {
      if (label === inheritedLabel) delete overrides[formatKey];
      else overrides[formatKey] = label;
    }
    if (loadingKey) {
      if (loadingText.trim()) overrides[loadingKey] = loadingText.trim();
      else delete overrides[loadingKey];
    }
    if (textTarget) {
      if (format.color || format.hoverColor || format.size) textFormats[formatKey] = format;
      else delete textFormats[formatKey];
    }
    if (target.kind === "media") {
      if (alt.trim()) overrides[altKey] = alt.trim();
      else delete overrides[altKey];
    }
    const media = asset && next === `cms-media:${asset.id}` && !draft.media.some((item) => item.id === asset.id)
      ? [...draft.media, asset]
      : draft.media;
    update({ ...draft, overrides, textFormats, media });
    setMessage("Applied to the preview.");
  }

  function reset() {
    if (range) {
      saveRange();
      setValue(range.original);
      setFormat({});
      setMessage("Selected words reset.");
      return;
    }
    const overrides = { ...draft.overrides };
    const textFormats = { ...draft.textFormats };
    delete overrides[key];
    delete overrides[altKey];
    delete overrides[formatKey];
    delete textFormats[formatKey];
    if (loadingKey) delete overrides[loadingKey];
    setLoadingText("");
    setLabel(inheritedLabel);
    setValue(inherited);
    setAlt("");
    setFormat({});
    update({ ...draft, overrides, textFormats });
    setMessage("Page edit reset.");
  }

  return (
    <form className="ctl-visual-form" onSubmit={apply}>
      {target.kind === "text" && (
        <label className="ctl-field">
          <span>{target.element.matches("button") ? "Button text" : "Content"}</span>
          <textarea rows={target.element.matches("button") ? 2 : 4} value={value} onChange={(event) => setValue(event.target.value)}
            aria-label={target.element.matches("button") ? "Button text" : "Content"} />
        </label>
      )}
      {range && (
        <label className="ctl-field">
          <span>Apply selected text to</span>
          <select aria-label="Apply selected text to" value={globalScope ? "global" : "page"}
            onChange={(event) => setGlobalScope(event.target.value === "global")}>
            <option value="page">This page</option>
            <option value="global">All pages with the same text</option>
          </select>
        </label>
      )}
      {linkedText && (
        <label className="ctl-field">
          <span>{target.element.matches("a.btn, a[class*='button']") ? "Button text" : "Link text"}</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} required />
        </label>
      )}
      {target.kind !== "text" && (
        <label className="ctl-field">
          <span>{target.kind === "link" ? "Link destination" : "Image or video URL"}</span>
          <input value={value.startsWith("cms-media:") ? "" : value} placeholder={value.startsWith("cms-media:") ? "Uploaded file selected" : undefined}
            onChange={(event) => setValue(event.target.value)} />
        </label>
      )}
      {loadingKey && (
        <label className="ctl-field">
          <span>Loading text</span>
          <input value={loadingText} onChange={(event) => setLoadingText(event.target.value)}
            placeholder="Optional, e.g. Opening…" maxLength={120} />
        </label>
      )}
      {textTarget && (
        <div className="ctl-visual-format">
          <label className="ctl-field">
            <span>Text color</span>
            <input type="color" value={format.color ?? textTarget.color}
              onChange={(event) => setFormat({ ...format, color: event.target.value })} />
          </label>
          <label className="ctl-field">
            <span>Text size (px)</span>
            <input type="number" min={textSize.min} max={textSize.max} value={format.size ?? textTarget.size}
              onChange={(event) => setFormat({ ...format, size: event.target.value ? Number(event.target.value) : undefined })} />
          </label>
          <div className="ctl-hover-field">
            <label className="ctl-field">
              <span>Hover color</span>
              <input type="color" value={format.hoverColor ?? format.color ?? textTarget.color}
                onChange={(event) => setFormat({ ...format, hoverColor: event.target.value })} />
            </label>
            {format.hoverColor && (
              <button type="button" className="ctl-button" aria-label="Restore default hover color"
                onClick={() => setFormat({ ...format, hoverColor: undefined })}>Default</button>
            )}
          </div>
        </div>
      )}
      {target.kind === "media" && (
        <>
          {draft.media.some((item) => item.type.startsWith(target.video ? "video/" : "image/")) && (
            <label className="ctl-field">
              <span>Choose an uploaded file</span>
              <select aria-label="Choose an uploaded file" value={value.startsWith("cms-media:") ? value : ""} onChange={(event) => { if (event.target.value) setValue(event.target.value); }}>
                <option value="">Select file…</option>
                {draft.media.filter((item) => item.type.startsWith(target.video ? "video/" : "image/")).map((item) =>
                  <option key={item.id} value={`cms-media:${item.id}`}>{item.name}</option>)}
              </select>
            </label>
          )}
          <label className="ctl-button ctl-visual-upload">
            <Upload size={16} /> {uploading ? "Uploading…" : "Upload replacement"}
            <input className="ctl-sr-only" type="file" accept={accepts} disabled={uploading} onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }} />
          </label>
          <label className="ctl-field">
            <span>{target.video ? "Video title" : "Alt text"}</span>
            <input value={alt} onChange={(event) => setAlt(event.target.value)} />
          </label>
        </>
      )}
      <div className="ctl-visual-actions">
        <button className="ctl-button ctl-primary" disabled={uploading}>Apply</button>
        {(range ? savedRange :
          key in draft.overrides || formatKey in draft.overrides || formatKey in (draft.textFormats ?? {}) ||
          altKey in draft.overrides || (loadingKey && loadingKey in draft.overrides)) &&
          <button className="ctl-button" type="button" onClick={reset}>Reset</button>}
      </div>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
