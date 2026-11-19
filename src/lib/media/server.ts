import "server-only";
import { cacheLife } from "next/cache";
import { bucket } from "@/lib/cms/server/firebase";
import registry from "./assets.json";

export type CloudAsset = { object: string; type: string; size: number; sha256?: string };
export function cloudAsset(path: string): CloudAsset | undefined {
  return Object.hasOwn(registry, path)
    ? (registry as Record<string, CloudAsset>)[path] : undefined;
}

// Keep signed URLs stable across range requests; cache expiry stays well within URL expiry.
export async function cloudMediaUrl(object: string) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 300, expire: 600 });
  const [url] = await bucket().file(object).getSignedUrl({
    action: "read", version: "v4", expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
}

export async function cloudImageData(path: string) {
  "use cache";
  cacheLife("max");
  const asset = cloudAsset(path);
  if (!asset?.type.startsWith("image/")) throw new Error("Unknown cloud image.");
  const [bytes] = await bucket().file(asset.object).download();
  return `data:${asset.type};base64,${bytes.toString("base64")}`;
}
