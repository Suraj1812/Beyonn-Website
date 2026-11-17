import { NextResponse, type NextRequest } from "next/server";
import { pages } from "@/content/pages";
import { articles } from "@/content/articles";

/**
 * Real 404 status for unknown URLs.
 *
 * The catch-all page route matches every path, and with Cache Components its
 * shell starts streaming before the page can call notFound(), so unknown URLs
 * would otherwise answer 200. Here we check the path first: known pages pass
 * through untouched; anything else still renders the site's not-found page,
 * but with a 404 status that search engines respect.
 */
const known = new Set<string>([
  "/",
  "/resources",
  ...Object.keys(pages).map((k) => `/${k}`),
  ...articles.map((a) => `/resources/${a.slug}`),
]);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (path === "/control" || path.startsWith("/control/")) return NextResponse.next();
  if (known.has(path)) return NextResponse.next();
  if (/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(path)) {
    try {
      const preview = request.nextUrl.searchParams.get("cms-preview") === "1" && request.cookies.has("__session");
      const url = new URL(preview ? "/api/control/resolve" : "/api/control/public", request.url);
      url.searchParams.set("path", path.slice(1));
      const response = await fetch(url, { headers: preview ? { cookie: request.headers.get("cookie") ?? "" } : {}, cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (response.ok && (await response.json()).exists) return NextResponse.next();
    } catch { /* Unknown paths still receive a real 404 if the resolver is unavailable. */ }
  }
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  // Skip Next internals, metadata routes, the share-image route and any file with an extension.
  matcher: ["/((?!_next/|og$|og/|api/|.*\\..*).*)"],
};
