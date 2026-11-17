import { getContent, getPublished } from "@/lib/cms/server/content";
import { requireAdmin } from "@/lib/cms/server/session";
import { failure, json } from "@/lib/cms/server/http";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const document = (await getContent("draft")) ?? (await getPublished());
    const path = new URL(request.url).searchParams.get("path") ?? "";
    return json({
      exists:
        path in (document.data.pages as object) ||
        (document.data.articles as { slug: string }[]).some(
          (article) => path === `resources/${article.slug}`,
        ),
    });
  } catch (e) {
    return failure(e);
  }
}
