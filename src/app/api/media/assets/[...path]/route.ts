import { bucket } from "@/lib/cms/server/firebase";
import { cloudAsset, cloudMediaUrl } from "@/lib/media/server";
import { failure } from "@/lib/cms/server/http";

type Context = { params: Promise<{ path: string[] }> };
async function serve(request: Request, context: Context, head = false) {
  try {
    const { path } = await context.params;
    // Only explicitly migrated site assets are public. CMS drafts and other bucket objects stay private.
    const asset = cloudAsset(`/${path.join("/")}`);
    if (!asset) return new Response(null, { status: 404 });
    const headers = {
      "Content-Type": asset.type,
      "Content-Length": String(asset.size),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    };
    if (head) return new Response(null, { headers });
    // Video/audio bytes travel directly from Storage to the visitor, including range/seek requests.
    if (/^(video|audio)\//.test(asset.type)) return new Response(null, {
      status: 307,
      headers: { Location: await cloudMediaUrl(asset.object), "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
    // Same-origin image responses preserve canvas/CSS masks and Next.js image optimization.
    // These are small images/captions. Finish the SDK download before exposing a body,
    // so a cancelled browser request cannot destroy an in-flight SDK pipeline.
    const [bytes] = await bucket().file(asset.object).download();
    return new Response(new Uint8Array(bytes), { headers });
  } catch (error) { return failure(error); }
}
export async function GET(request: Request, context: Context) { return serve(request, context); }
export async function HEAD(request: Request, context: Context) { return serve(request, context, true); }
