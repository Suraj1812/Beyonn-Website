import { validateDocument, type CmsDocument, type Revision } from "./model";
export interface ContentRepository {
  read(slot: "draft" | "published"): Promise<CmsDocument | undefined>;
  write(slot: "draft" | "published", document: CmsDocument): Promise<void>;
  revisions(): Promise<Revision[]>;
  putMedia(id: string, blob: Blob): Promise<void>;
  getMedia(id: string): Promise<Blob | undefined>;
}
let draftVersion = "";
async function result(response: Response) {
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Unable to reach the content service.");
  return data;
}
export const repository: ContentRepository = {
  async read(slot) {
    const data = await result(
      await fetch(
        slot === "published"
          ? "/api/control/public"
          : "/api/control/content?slot=draft",
        { cache: "no-store" },
      ),
    );
    if (slot === "draft") draftVersion = data.version ?? "";
    if (data.document) validateDocument(data.document);
    return data.document;
  },
  async write(slot, document) {
    validateDocument(document);
    const data = await result(
      await fetch("/api/control/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, document, version: draftVersion }),
      }),
    );
    draftVersion = data.version;
  },
  async revisions() {
    return result(await fetch("/api/control/history", { cache: "no-store" }));
  },
  async putMedia(id, blob) {
    const policy = await result(await fetch(`/api/control/media/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'prepare', type: blob.type, size: blob.size }) }));
    const form = new FormData();
    for (const [key, value] of Object.entries(policy.fields as Record<string, string>)) form.append(key, value);
    form.append('file', blob);
    const upload = await fetch(policy.url, { method: 'POST', body: form });
    if (!upload.ok) throw new Error('The media upload failed. Please try again.');
    await result(await fetch(`/api/control/media/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'complete' }) }));
  },
  async getMedia(id) {
    const response = await fetch(`/api/control/media/${id}`, {
      cache: "no-store",
    });
    if (response.status === 404) return undefined;
    if (!response.ok) await result(response);
    return response.blob();
  },
};
export const CMS_CHANNEL = "beyonn-control";
export function announce(slot: "draft" | "published") {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CMS_CHANNEL);
    channel.postMessage(slot);
    channel.close();
  }
  window.dispatchEvent(new CustomEvent(CMS_CHANNEL, { detail: slot }));
}
