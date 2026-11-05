import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Share image for every page (Open Graph + Twitter), 1200 x 630.
 * /og?title=…&kicker=…  → navy card with the Beyonn logo, the page title and the emblem.
 * Built from local brand files read once at module scope.
 */
const [logo, emblem] = await Promise.all([
  readFile(join(process.cwd(), "public/assets/beyonn-logo.png"), "base64"),
  readFile(join(process.cwd(), "public/assets/site/beyonn-emblem.png"), "base64"),
]);
const logoSrc = `data:image/png;base64,${logo}`;
const emblemSrc = `data:image/png;base64,${emblem}`;

const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Build the practice beyond the chair.").slice(0, 110);
  const kicker = (searchParams.get("kicker") || "The OSA + TMD program your team can run").slice(0, 60);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #1c395e 0%, #13253e 100%)",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* emblem bleeding off the right edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={emblemSrc} width={760} height={620} alt="" style={{ position: "absolute", right: -170, top: 40, opacity: 0.1 }} />

        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 999, padding: "14px 26px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={234} height={48} alt="Beyonn" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: "#72cfb7", marginBottom: 22 }}>{kicker}</div>
          <div style={{ fontSize: title.length > 60 ? 56 : 68, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, color: "rgba(255,255,255,0.72)" }}>
          <div style={{ width: 56, height: 4, borderRadius: 4, background: "linear-gradient(90deg, #72cfb7, #3177bf)" }} />
          beyonn.com · Beyond Training. Beyond Billing. Beyond the Appliance.
        </div>
      </div>
    ),
    size,
  );
  image.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return image;
}
