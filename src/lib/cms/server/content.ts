import "server-only";
import { after } from "next/server";
import { firebaseSettings } from "./config";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import {
  createDefaultDocument,
  validateDocument,
  type CmsDocument,
} from "../model";
import { database } from "./firebase";
import { HttpError } from "./http";
import { randomUUID } from "node:crypto";
// Framework cache is shared by the routes that consume this function and invalidated on publish.
export async function getPublished(): Promise<CmsDocument> {
  'use cache';
  cacheTag('cms-published');
  cacheLife({ stale: 0, revalidate: 10, expire: 15 });
  if (!firebaseSettings().projectId) return createDefaultDocument();
  const snapshot = await database().collection('cms_content').doc('published').get();
  const document: unknown = snapshot.exists ? JSON.parse(snapshot.get('json')) : createDefaultDocument();
  validateDocument(document);
  return document;
}
export async function getContent(slot: "draft" | "published") {
  const snapshot = await database().collection("cms_content").doc(slot).get();
  if (!snapshot.exists) return undefined;
  const doc: unknown = JSON.parse(snapshot.get("json"));
  validateDocument(doc);
  return doc;
}
export async function saveContent(
  slot: "draft" | "published",
  value: unknown,
  uid: string,
  expectedVersion?: string,
) {
  try {
    validateDocument(value);
  } catch (e) {
    throw new HttpError(
      400,
      e instanceof Error ? e.message : "Invalid content.",
    );
  }
  const encoded = JSON.stringify(value);
  const mediaIds = [
    ...new Set(
      Array.from(
        encoded.matchAll(/cms-media:([a-zA-Z0-9-]+)/g),
        (match) => match[1],
      ),
    ),
  ];
  if (mediaIds.length) {
    const assets = await database().getAll(
      ...mediaIds.map((id) => database().collection("cms_assets").doc(id)),
    );
    if (assets.some((asset) => !asset.exists))
      throw new HttpError(
        400,
        "A referenced media file is missing. Upload it before saving.",
      );
  }
  if (Buffer.byteLength(encoded) > 850_000)
    throw new HttpError(
      413,
      "The website configuration must stay under 850 KB.",
    );
  const db = database();
  const now = new Date().toISOString();
  const version = randomUUID();
  const draft = db.collection("cms_content").doc("draft");
  const live = db.collection("cms_content").doc("published");
  const revision = db.collection("cms_history").doc(version);
  await db.runTransaction(async (tx) => {
    const current = await tx.get(draft);
    if (
      expectedVersion !== undefined &&
      current.exists &&
      current.get("version") !== expectedVersion
    )
      throw new HttpError(
        409,
        "Another admin saved changes. Export your edits, then reload before saving.",
      );
    tx.set(draft, { json: encoded, at: now, uid, version });
    if (slot === "published")
      tx.set(live, { json: encoded, at: now, uid, version });
    tx.set(revision, {
      json: encoded,
      at: now,
      uid,
      label: slot === "published" ? "Website published" : "Draft saved",
    });
  });
  if (slot === "published") revalidateTag('cms-published', { expire: 0 });
  // Keep a bounded rollback history. Blob assets remain immutable so old revisions can restore them.
  after(async () => {
    try {
      const old = await db.collection('cms_history').orderBy('at', 'desc').offset(20).limit(50).select().get();
      if (!old.empty) { const batch = db.batch(); old.docs.forEach(document => batch.delete(document.ref)); await batch.commit(); }
    } catch { console.error('CMS history retention will retry after the next save.'); }
  });
  return version;
}
