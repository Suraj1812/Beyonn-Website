import { cloudAsset, cloudMediaUrl } from "@/lib/media/server";
import { failure } from "@/lib/cms/server/http";

export async function GET() {
  try {
    const asset = cloudAsset("/assets/videos/oral-appliance-demo-original.mp4");
    if (!asset) return new Response(null, { status: 404 });
    const url = await cloudMediaUrl(asset.object);
    return new Response(null, {
      status: 307,
      headers: {
        Location: url,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
