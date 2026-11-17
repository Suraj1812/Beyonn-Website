import { getRevisions } from "@/lib/cms/server/content";
import { requireAdmin } from "@/lib/cms/server/session";
import { failure, json } from "@/lib/cms/server/http";
export async function GET() {
  try {
    await requireAdmin();
    return json(await getRevisions());
  } catch (e) {
    return failure(e);
  }
}
