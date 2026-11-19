"use client";
import {
  createDefaultDocument,
  normalize,
  type CmsDocument,
} from "@/lib/cms/model";
import { EDITOR_DOCUMENT, EDITOR_READY, pageOverrideKey } from "@/lib/cms/visual";
import { CMS_CHANNEL, repository } from "@/lib/cms/storage";
import { usePathname } from "next/navigation";
import { migratedMediaSource } from "@/lib/media/aliases";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const Context = createContext<{
  document: CmsDocument;
  mediaUrls: Record<string, string>;
  preview: boolean;
  editing: boolean;
  pathname: string;
}>({ document: createDefaultDocument(), mediaUrls: {}, preview: false, editing: false, pathname: "/" });
export const useCms = () => useContext(Context);
export function useCmsData<T>(key: string, fallback: T): T {
  const { document } = useCms();
  return (document.data[key] ?? fallback) as T;
}
export function useCmsText() {
  const { document, mediaUrls, pathname } = useCms();
  return useMemo(
    () =>
      (value: string, kind: "text" | "link" | "media" = "text") => {
        const source = normalize(value);
        const replacement = document.overrides[pageOverrideKey(pathname, kind, source)] ?? document.overrides[`${kind}:${source}`];
        const next = replacement === undefined
          ? (kind === "media" || kind === "link" ? migratedMediaSource(value) : value)
          : replacement;
        return next.startsWith("cms-media:")
          ? (mediaUrls[next.slice(10)] ??
              `/api/control/media/${next.slice(10)}`)
          : next;
      },
    [document.overrides, mediaUrls, pathname],
  );
}
export function CmsProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: CmsDocument;
}) {
  const [document, setDocument] = useState(initial ?? createDefaultDocument);
  const mediaUrls = useMemo(
    () =>
      Object.fromEntries(
        document.media.map((asset) => [
          asset.id,
          `/api/control/media/${asset.id}`,
        ]),
      ),
    [document.media],
  );
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const inPreview = window.self !== window.top && query.get("cms-preview") === "1";
    if (inPreview && query.get("cms-edit") === "1") {
      let fromControl = false;
      try { fromControl = window.parent.location.pathname === "/control"; } catch { /* Cross-origin frames cannot edit. */ }
      if (fromControl) {
        const receive = (event: MessageEvent<{ type: string; document: CmsDocument }>) => {
          if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== EDITOR_DOCUMENT) return;
          setDocument(event.data.document);
          setPreview(true);
          setEditing(true);
        };
        window.addEventListener("message", receive);
        window.parent.postMessage({ type: EDITOR_READY }, location.origin);
        return () => window.removeEventListener("message", receive);
      }
    }
    let disposed = false;
    let version = 0;
    const load = async () => {
      const request = ++version;
      setPreview(inPreview);
      try {
        const next = await repository.read(inPreview ? "draft" : "published");
        if (!disposed && request === version)
          setDocument(next ?? createDefaultDocument());
      } catch {
        /* The server-rendered published version remains usable if a refresh fails. */
      }
    };
    void load();
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(CMS_CHANNEL)
        : null;
    const listener = () => {
      void load();
    };
    if (channel) channel.onmessage = listener;
    window.addEventListener(CMS_CHANNEL, listener);
    return () => {
      disposed = true;
      channel?.close();
      window.removeEventListener(CMS_CHANNEL, listener);
    };
  }, [pathname]);
  return (
    <Context.Provider value={{ document, mediaUrls, preview, editing, pathname }}>
      {children}
    </Context.Provider>
  );
}
