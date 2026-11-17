import { Readable } from "node:stream";
import { bucket, database } from "@/lib/cms/server/firebase";
import { getPublished } from "@/lib/cms/server/content";
import { getSession, requireAdmin } from "@/lib/cms/server/session";
import {
  failure,
  HttpError,
  json,
  limitedBody,
  parseJson,
  sameOrigin,
} from "@/lib/cms/server/http";
type Context = { params: Promise<{ id: string }> };
const MAX = 20 * 1024 * 1024;
function checkId(id: string) {
  if (!/^[a-zA-Z0-9-]{20,64}$/.test(id))
    throw new HttpError(400, "Invalid media ID.");
}
function validSignature(type: string, bytes: Buffer) {
  if (type === "image/png")
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/jpeg")
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/webp")
    return (
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP"
    );
  if (type === "image/gif")
    return ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6));
  if (type === "video/mp4") return bytes.toString("ascii", 4, 8) === "ftyp";
  if (type === "video/webm")
    return bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]));
  return false;
}
// Browser binaries go directly to a private staging object, avoiding serverless body limits.
export async function POST(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    const session = await requireAdmin();
    const { id } = await params; checkId(id);
    const body = await parseJson(request, 4096) as { action?: string; type?: string; size?: number };
    const intent = database().collection('cms_uploads').doc(id);
    const asset = database().collection('cms_assets').doc(id);
    const source = bucket().file(`incoming/${id}`);
    if (body.action === 'prepare') {
      if (!['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm'].includes(body.type ?? '') || !Number.isInteger(body.size) || Number(body.size) < 12 || Number(body.size) > MAX) throw new HttpError(400, 'Choose a supported image or video up to 20 MB.');
      const [policy] = await source.generateSignedPostPolicyV4({ expires: Date.now() + 10 * 60_000, fields: { 'Content-Type': body.type!, success_action_status: '201' }, conditions: [['content-length-range', body.size!, body.size!]] });
      await intent.create({ uid: session.uid, type: body.type, size: body.size, expiresAt: Date.now() + 15 * 60_000 });
      return json(policy);
    }
    if (body.action !== 'complete') throw new HttpError(400, 'Invalid upload action.');
    const existing = await asset.get();
    if (existing.exists && existing.get('uid') === session.uid) return json({ id, size: existing.get('size') });
    const upload = (await intent.get()).data();
    if (!upload || upload.uid !== session.uid || upload.expiresAt < Date.now()) throw new HttpError(400, 'This upload has expired. Please select the file again.');
    const [metadata] = await source.getMetadata();
    if (Number(metadata.size) !== upload.size || Number(metadata.size) > MAX || metadata.contentType !== upload.type) throw new HttpError(415, 'The uploaded file does not match its approved type or size.');
    const [header] = await source.download({ start: 0, end: 11, validation: false });
    if (!validSignature(upload.type, header)) throw new HttpError(415, 'The file content does not match its image or video format.');
    await source.copy(bucket().file(`cms/${id}`), { preconditionOpts: { ifGenerationMatch: 0 } });
    await asset.create({ type: upload.type, size: upload.size, uid: session.uid, createdAt: new Date().toISOString() });
    return json({ id, size: upload.size }, 201);
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    const session = await requireAdmin();
    const { id } = await params;
    checkId(id);
    const type = request.headers.get("content-type")?.split(";")[0] ?? "";
    const bytes = await limitedBody(request, MAX);
    if (bytes.length < 12 || !validSignature(type, bytes))
      throw new HttpError(
        415,
        "Use a valid PNG, JPEG, WebP, GIF, MP4 or WebM file.",
      );
    try {
      await bucket()
        .file(`cms/${id}`)
        .save(bytes, {
          contentType: type,
          resumable: false,
          preconditionOpts: { ifGenerationMatch: 0 },
          metadata: {
            cacheControl: "private, max-age=0",
            metadata: { uploadedBy: session.uid },
          },
        });
    } catch (error) {
      if ((error as { code?: number }).code === 404)
        throw new HttpError(
          503,
          "Media Storage is not enabled yet. Connect a billing-enabled Firebase Storage bucket to upload files.",
        );
      throw error;
    }
    await database().collection("cms_assets").doc(id).set({
      type,
      size: bytes.length,
      uid: session.uid,
      createdAt: new Date().toISOString(),
    });
    return json({ id, size: bytes.length }, 201);
  } catch (e) {
    return failure(e);
  }
}
export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    checkId(id);
    const published = await getPublished();
    const isPublic = JSON.stringify({
      data: published.data,
      overrides: published.overrides,
      home: published.home,
    }).includes(`cms-media:${id}`);
    if (!isPublic && !(await getSession()))
      throw new HttpError(404, "Media not found.");
    const metadata = await database().collection("cms_assets").doc(id).get();
    if (!metadata.exists) throw new HttpError(404, "Media not found.");
    const size = metadata.get("size") as number;
    const type = metadata.get("type") as string;
    const headers: Record<string, string> = {
      "Content-Type": type,
      "Content-Length": String(size),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Accept-Ranges": "bytes",
      "Cache-Control": isPublic ? "public, max-age=86400" : "private, no-store",
      Vary: "Cookie",
    };
    const range = request.headers.get("range");
    let start = 0;
    let end = size - 1;
    let status = 200;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2]))
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      if (!match[1]) start = Math.max(0, size - Number(match[2]));
      else {
        start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), size - 1);
      }
      if (start >= size || start > end)
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
      headers["Content-Length"] = String(end - start + 1);
    }
    const stream = bucket().file(`cms/${id}`).createReadStream({ start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status,
      headers,
    });
  } catch (e) {
    return failure(e);
  }
}
