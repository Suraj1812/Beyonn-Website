import { getPublished } from "@/lib/cms/server/content";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { SiteShell } from "./SiteShell";
export async function PublishedShell({ children }: { children: ReactNode }) {
  await connection();
  const initial = await getPublished();
  return <SiteShell initial={initial}>{children}</SiteShell>;
}
