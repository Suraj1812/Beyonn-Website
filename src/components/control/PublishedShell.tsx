import { getPublished } from "@/lib/cms/server/content";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { SiteShell } from "./SiteShell";
export async function PublishedShell({ children }: { children: ReactNode }) {
  await connection();
  const initial = await getPublished();
  return <SiteShell initial={initial}>{children}</SiteShell>;
}


// Public metadata uses the current published document. In a static page, mark
// that request-time work explicitly so Cache Components can stream it.
async function MetadataRequest() {
  await connection();
  return null;
}

export function PublishedMetadataBoundary() {
  return <Suspense><MetadataRequest /></Suspense>;
}
