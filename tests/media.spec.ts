import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import registry from "../src/lib/media/assets.json";

test.describe("cloud media delivery", () => {
  test.skip(process.env.CMS_MEDIA_E2E !== "1", "Requires read access and signing credentials for the real media bucket.");

  test("all registered public URLs resolve and private objects stay inaccessible", async ({ request }) => {
    for (const [path, asset] of Object.entries(registry)) {
      const response = await request.head(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toBe(asset.type);
      expect(response.headers()["cache-control"], path).toContain("s-maxage=86400");
    }
    for (const path of ["/api/media/assets/cms/private-draft", "/assets/not-uploaded.png", "/api/media/assets/toString"])
      expect((await request.get(path)).status()).toBe(404);
  });

  test("images retain optimization and share cards use cloud brand images", async ({ request }) => {
    for (const path of ["/icon.png", "/assets/beyonn-logo.png", "/assets/site/beyonn-emblem.png", "/assets/videos/website-walkthrough-poster.jpg"]) {
      const asset = (registry as Record<string, { size: number; sha256?: string }>)[path];
      const original = await request.get(path);
      expect(original.status(), path).toBe(200);
      const bytes = await original.body();
      expect(bytes.length, path).toBe(asset.size);
      expect(createHash("sha256").update(bytes).digest("hex"), path).toBe(asset.sha256);
    }
    const image = await request.get("/_next/image?url=%2Fassets%2Fbeyonn-logo.png&w=256&q=75");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toMatch(/^image\//);
    const share = await request.get("/og?title=Cloud%20media");
    expect(share.status()).toBe(200);
    expect(share.headers()["content-type"]).toContain("image/png");
  });

  test("video and audio bytes come directly from Storage and support seeking", async ({ request }) => {
    for (const [path, asset] of Object.entries(registry).filter(([, value]) => /^(video|audio)\//.test(value.type))) {
      const redirect = await request.get(path, { maxRedirects: 0 });
      expect(redirect.status(), path).toBe(307);
      const location = redirect.headers().location;
      expect(new URL(location).hostname).toBe("storage.googleapis.com");
      const segment = await request.get(location, { headers: { Range: "bytes=0-31" } });
      expect(segment.status(), path).toBe(206);
      expect((await segment.body()).length).toBe(32);
      expect(segment.headers()["content-range"]).toBe(`bytes 0-31/${asset.size}`);
    }
  });

  test("external video defaults render cloud players", async ({ page }) => {
    await page.goto("/the-beyonn-system");
    const walkthrough = page.locator('video[src="/assets/videos/website-walkthrough.mp4"]');
    await expect(walkthrough).toHaveCount(1);
    await expect(walkthrough).toHaveAttribute("preload", "none");
    await expect(page.locator('iframe[src*="frame.io"]')).toHaveCount(0);
    await walkthrough.evaluate(async (element: HTMLVideoElement) => {
      element.muted = true;
      await element.play();
    });
    await expect.poll(() => walkthrough.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 15_000 }).toBeGreaterThan(0);
    await page.goto("/dr-rodney-willey");
    // The introduction also appears on the homepage; inspect whichever page contains it.
    if (!await page.locator('video[src="/assets/videos/doctor-introduction.mp4"]').count()) await page.goto("/");
    await expect(page.locator('video[src="/assets/videos/doctor-introduction.mp4"]').first()).toBeAttached();
    await expect(page.locator('iframe[src*="player.mux.com"]')).toHaveCount(0);
  });
});
