import { getPublished } from "@/lib/cms/server/content";
import { failure, json } from "@/lib/cms/server/http";
export async function GET(request: Request) {
  try {
    const document = await getPublished();
    const path = new URL(request.url).searchParams.get("path");
    return json(
      path
        ? {
            exists:
              path in (document.data.pages as object) ||
              (document.data.articles as { slug: string }[]).some(
                (article) => path === `resources/${article.slug}`,
              ),
          }
        : { document },
    );
  } catch (e) {
    return failure(e);
  }
}
