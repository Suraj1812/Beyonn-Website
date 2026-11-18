import { bucket } from "@/lib/cms/server/firebase";
import { failure } from "@/lib/cms/server/http";

export async function GET() {
  try {
    const [url] = await bucket().file("site/oral-appliance-demo-original.mp4").getSignedUrl({
      action: "read",
      version: "v4",
      expires: Date.now() + 60 * 60 * 1000,
    });
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
