"use client";

import { ExternalLink, MousePointer2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { safeUrl, type CmsDocument, type MediaAsset } from "@/lib/cms/model";
import { repository } from "@/lib/cms/storage";
import {
  EDITOR_DOCUMENT,
  EDITOR_READY,
  pageOverrideKey,
  textSize,
  type TextFormat,
  type VisualKind,
} from "@/lib/cms/visual";

type Target = {
  kind: VisualKind;
  source: string;
  label: string;
  color: string;
  size: number;
  video: boolean;
};

const kinds = ["text", "media", "link"] as const;
const labels = { text: "Text", media: "Media", link: "Link" };
const marker = (kind: VisualKind) => `data-cms-edit-${kind}`;
const targetKey = (target: Target) => `${target.kind}:${target.source}`;
const selector = kinds.map((kind) => `[${marker(kind)}]`).join(",");
const textBlock = `:is(h1,h2,h3,h4,h5,h6,p,blockquote)[${marker("text")}]`;

function pick(element: Element, kind: VisualKind): Target {
  const source = element.getAttribute(marker(kind)) ?? "";
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const rgb = /^rgba?\(/.test(style?.color ?? "") ? style?.color.match(/\d+/g)?.slice(0, 3) : undefined;
  return {
    kind, source,
    label: (kind === "media"
      ? element.getAttribute("alt") || element.getAttribute("title") || source.split("/").at(-1)
      : element.textContent?.trim()) || source,
    color: rgb?.length === 3 ? `#${rgb.map((n) => Number(n).toString(16).padStart(2, "0")).join("")}` : "#1c395e",
    size: Math.min(textSize.max, Math.max(textSize.min, Math.round(parseFloat(style?.fontSize || "16")))),
    video: ["VIDEO", "IFRAME", "SOURCE"].includes(element.tagName) || /\.(mp4|webm)(\?|$)/i.test(source),
  };
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
  const [ready, setReady] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selected, setSelected] = useState<Target>();
  const [kind, setKind] = useState<VisualKind>("text");

  useEffect(() => {
    const receive = (event: MessageEvent<{ type: string }>) => {
      if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === EDITOR_READY)
        setReady(true);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({ type: EDITOR_DOCUMENT, document: draft }, location.origin);
  }, [draft, ready]);

  useEffect(() => {
    if (!frameDocument) return;
    function choose(event: MouseEvent) {
      const target = event.target as Element | null;
      if (target?.nodeType !== 1) return;
      onInteraction();
      const matches = [kind, ...kinds.filter((item) => item !== kind)];
      for (const item of matches) {
        const element =
          (item === "text" && target.closest(textBlock)) ||
          target.closest(`[${marker(item)}]`);
        if (!element) continue;
        event.preventDefault();
        event.stopPropagation();
        setKind(item);
        setSelected(pick(element, item));
        if (matchMedia("(max-width: 900px)").matches)
          inspector.current?.scrollIntoView({ block: "nearest" });
        return;
      }
      // The editor should not follow links or submit live forms.
      if (target.closest("a, button, form")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    frameDocument.addEventListener("click", choose, true);
    return () => frameDocument.removeEventListener("click", choose, true);
  }, [frameDocument, kind, onInteraction]);

  useEffect(() => {
    if (!frameDocument) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        const next = new Map<string, Target>();
        for (const el of frameDocument.querySelectorAll(selector)) {
          for (const item of kinds) {
            if (!el.hasAttribute(marker(item))) continue;
            if (item !== "media" && (!el.getClientRects().length || el.closest('[aria-hidden="true"]'))) continue;
            const selected = pick(el, item);
            if (!next.has(targetKey(selected))) next.set(targetKey(selected), selected);
          }
        }
        setTargets([...next.values()]);
      }, 120);
    };
    const observer = new MutationObserver(refresh);
    observer.observe(frameDocument, { childList: true, subtree: true, attributes: true, attributeFilter: kinds.map(marker) });
    refresh();
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [frameDocument]);

  useEffect(() => {
    const selectedElement = selected && Array.from(
      frameDocument?.querySelectorAll(`[${marker(selected.kind)}]`) ?? [],
    ).find((element) => element.getAttribute(marker(selected.kind)) === selected.source && element.getClientRects().length);
    if (!selectedElement) return;
    selectedElement.setAttribute("data-cms-editor-selected", "");
    return () => selectedElement.removeAttribute("data-cms-editor-selected");
  }, [frameDocument, selected, targets]);

  return (
    <div className="ctl-visual">
      <div className="ctl-visual-bar">
        <label className="ctl-field">
          <span>Page</span>
          <select aria-label="Page" value={path} onChange={(event) => selectPage(event.target.value)}>
            {pages.map((page) => <option key={page.path} value={page.path}>{page.label}</option>)}
          </select>
        </label>
        <a className="ctl-button ctl-small" href={path} target="_blank" rel="noopener noreferrer">
          Open live page <ExternalLink size={14} />
        </a>
      </div>
      <div className="ctl-visual-grid">
        <iframe
          ref={frame}
          title="Editable website preview"
          src={`${path}?cms-preview=1&cms-edit=1`}
          onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
        />
        <aside ref={inspector} className="ctl-visual-inspector" aria-label="Edit selected content">
          <div className="ctl-visual-kinds" role="group" aria-label="What to edit">
            {kinds.map((item) => (
              <button key={item} type="button" aria-pressed={kind === item}
                onClick={() => { setKind(item); setSelected(undefined); }}>
                {item === "link" ? "Links" : labels[item]}
              </button>
            ))}
          </div>
          <label className="ctl-field">
            <span>{labels[kind]}</span>
            <select aria-label={labels[kind]} value={selected ? targetKey(selected) : ""} onChange={(event) => {
              const next = targets.find((item) => targetKey(item) === event.target.value);
              setSelected(next);
              if (next && frameDocument) {
                Array.from(frameDocument.querySelectorAll(`[${marker(kind)}]`))
                  .find((el) => el.getAttribute(marker(kind)) === next.source && el.getClientRects().length)
                  ?.scrollIntoView({ block: "center" });
              }
            }}>
              <option value="">{ready ? `Select ${labels[kind].toLowerCase()}…` : "Loading page…"}</option>
              {selected && !targets.some((item) => targetKey(item) === targetKey(selected)) &&
                <option value={targetKey(selected)}>{selected.label.slice(0, 95)}</option>}
              {targets.filter((item) => item.kind === kind).map((item) => (
                <option key={targetKey(item)} value={targetKey(item)}>{item.label.slice(0, 95)}</option>
              ))}
            </select>
          </label>
          {selected ? (
            <EditTarget key={targetKey(selected)} target={selected} path={path} draft={draft} update={update} />
          ) : (
            <p className="ctl-visual-hint"><MousePointer2 size={17} /> Click the part of the page you want to edit.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function EditTarget({ target, path, draft, update }: {
  target: Target;
  path: string;
  draft: CmsDocument;
  update: (draft: CmsDocument) => void;
}) {
  const key = pageOverrideKey(path, target.kind, target.source);
  const altKey = pageOverrideKey(path, "text", `media-alt:${target.source}`);
  const inherited = draft.overrides[targetKey(target)] ?? target.source;
  const [value, setValue] = useState(draft.overrides[key] ?? inherited);
  const [alt, setAlt] = useState(draft.overrides[altKey] ?? "");
  const [format, setFormat] = useState<TextFormat>(draft.textFormats?.[key] ?? {});
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

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = target.kind === "text" ? value : value.trim();
    if (target.kind !== "text" && !safeUrl(next, target.kind === "media")) {
      setMessage("Enter a valid HTTPS URL or website path.");
      return;
    }
    const overrides = { ...draft.overrides };
    const textFormats = { ...draft.textFormats };
    if (next === inherited) delete overrides[key];
    else overrides[key] = next;
    if (target.kind === "text") {
      if (format.color || format.size) textFormats[key] = format;
      else delete textFormats[key];
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
    const overrides = { ...draft.overrides };
    const textFormats = { ...draft.textFormats };
    delete overrides[key];
    delete overrides[altKey];
    delete textFormats[key];
    setValue(inherited);
    setAlt("");
    setFormat({});
    update({ ...draft, overrides, textFormats });
    setMessage("Page edit reset.");
  }

  return (
    <form className="ctl-visual-form" onSubmit={apply}>
      {target.kind === "text" ? (
        <>
          <label className="ctl-field">
            <span>Content</span>
            <textarea aria-label="Content" rows={4} value={value} onChange={(event) => setValue(event.target.value)} />
          </label>
          <div className="ctl-visual-format">
            <label className="ctl-field">
              <span>Text color</span>
              <input type="color" value={format.color ?? target.color}
                onChange={(event) => setFormat({ ...format, color: event.target.value })} />
            </label>
            <label className="ctl-field">
              <span>Text size (px)</span>
              <input type="number" min={textSize.min} max={textSize.max} value={format.size ?? target.size}
                onChange={(event) => setFormat({ ...format, size: event.target.value ? Number(event.target.value) : undefined })} />
            </label>
          </div>
        </>
      ) : (
        <label className="ctl-field">
          <span>{target.kind === "link" ? "Link destination" : "Image or video URL"}</span>
          <input value={value.startsWith("cms-media:") ? "" : value} placeholder={value.startsWith("cms-media:") ? "Uploaded file selected" : undefined}
            onChange={(event) => setValue(event.target.value)} />
        </label>
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
        {(key in draft.overrides || key in (draft.textFormats ?? {}) || altKey in draft.overrides) &&
          <button className="ctl-button" type="button" onClick={reset}>Reset</button>}
      </div>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
