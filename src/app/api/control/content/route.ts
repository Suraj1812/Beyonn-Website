import { saveContent } from "@/lib/cms/server/content";
import { validateDocument } from "@/lib/cms/model";
import { database } from "@/lib/cms/server/firebase";
import { requireAdmin } from "@/lib/cms/server/session";
import {
  failure,
  HttpError,
  json,
  parseJson,
  sameOrigin,
} from "@/lib/cms/server/http";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const slot =
      new URL(request.url).searchParams.get("slot") === "published"
        ? "published"
        : "draft";
    const snapshot = await database().collection("cms_content").doc(slot).get();
    const document: unknown = snapshot.exists
      ? JSON.parse(snapshot.get("json"))
      : undefined;
    if (document) validateDocument(document);
    return json({
      document,
      version: snapshot.exists ? snapshot.get("version") : "",
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const session = await requireAdmin();
    const body = (await parseJson(request)) as {
      slot?: unknown;
      document?: unknown;
      version?: unknown;
    };
    if (!["draft", "published"].includes(String(body.slot)))
      throw new HttpError(400, "Invalid content destination.");
    const version = await saveContent(
      body.slot as "draft" | "published",
      body.document,
      session.uid,
      typeof body.version === "string" ? body.version : "",
    );
    return json({ version });
  } catch (e) {
    return failure(e);
  }
}
