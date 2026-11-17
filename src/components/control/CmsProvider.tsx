"use client";
import {
  createDefaultDocument,
  normalize,
  type CmsDocument,
} from "@/lib/cms/model";
import { CMS_CHANNEL, repository } from "@/lib/cms/storage";
import { usePathname } from "next/navigation";
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
}>({ document: createDefaultDocument(), mediaUrls: {}, preview: false });
export const useCms = () => useContext(Context);
export function useCmsData<T>(key: string, fallback: T): T {
  const { document } = useCms();
  return (document.data[key] ?? fallback) as T;
}
export function useCmsText() {
  const { document, mediaUrls } = useCms();
  return useMemo(
    () =>
      (value: string, kind: "text" | "link" | "media" = "text") => {
        const replacement = document.overrides[`${kind}:${normalize(value)}`];
        const next = replacement === undefined ? value : replacement;
        return next.startsWith("cms-media:")
          ? (mediaUrls[next.slice(10)] ??
              `/api/control/media/${next.slice(10)}`)
          : next;
      },
    [document.overrides, mediaUrls],
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
  const pathname = usePathname();
  useEffect(() => {
    let disposed = false;
    let version = 0;
    const load = async () => {
      const request = ++version;
      // Drafts are only visible inside a same-origin preview frame opened by Control.
      const inPreview =
        window.self !== window.top &&
        new URLSearchParams(location.search).get("cms-preview") === "1";
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
    <Context.Provider value={{ document, mediaUrls, preview }}>
      {children}
    </Context.Provider>
  );
}
