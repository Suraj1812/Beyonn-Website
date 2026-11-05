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
  "/endorsements",
  ...Object.keys(pages).map((k) => `/${k}`),
  ...articles.map((a) => `/resources/${a.slug}`),
]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (known.has(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  // Skip Next internals, metadata routes, the share-image route and any file with an extension.
  matcher: ["/((?!_next/|og$|og/|api/|.*\\..*).*)"],
};
