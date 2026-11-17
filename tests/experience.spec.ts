import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test.describe("Native scrolling", () => {
  test.use({ reducedMotion: "no-preference" });

  test("wheel input stays native and dialogs still lock the page", async ({ page }) => {
    await page.goto("/team");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    const prevented = page.evaluate(() => new Promise<boolean>((resolve) => {
      window.addEventListener("wheel", (event) => queueMicrotask(() => resolve(event.defaultPrevented)), { once: true, passive: true });
    }));
    await page.mouse.move(30, 500);
    await page.mouse.wheel(0, 400);
    expect(await prevented).toBe(false);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
    await expect(page.locator("html")).not.toHaveClass(/lenis-smooth/);

    await page.goto("/patients");
    await page.getByRole("button", { name: "Get My Snore Score", exact: true }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
    const lockedPosition = await page.evaluate(() => scrollY);
    await page.mouse.move(10, 500);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(lockedPosition);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(lockedPosition + 100);
  });

  test("cross-page anchors still settle below the header", async ({ page }) => {
    await page.goto("/academy#academy-tier-2");
    await expect(page.locator("#academy-tier-2")).toBeVisible();
    await expect.poll(async () => (await page.locator("#academy-tier-2").boundingBox())!.y).toBeLessThan(220);
    const position = await page.locator("#academy-tier-2").boundingBox();
    expect(position!.y).toBeGreaterThanOrEqual(50);
  });
});

test.describe("Team reveal timing", () => {
  test.use({ reducedMotion: "no-preference" });

  test("hero waits for the loader and illustration before revealing", async ({ page }) => {
    let releaseImage!: () => void;
    const released = new Promise<void>((resolve) => { releaseImage = resolve; });
    await page.route("**/*team-at-work-v3*", async (route) => {
      await released;
      await route.continue();
    });
    try {
      await page.goto("/team", { waitUntil: "domcontentloaded" });
      const hero = page.locator("main section").first();
      const reveals = hero.locator("[data-aos-wait-for-images]");
      await expect(reveals).toHaveCount(2);
      await expect(page.locator(".intro")).toHaveCSS("visibility", "hidden");
      // Exercise the load-event failsafe too: a slow image must still hold the hero.
      await page.waitForTimeout(800);
      await expect.poll(() => reveals.evaluateAll((nodes) => nodes.every((node) => !node.classList.contains("aos-animate")))).toBe(true);
      releaseImage();
      await expect.poll(() => hero.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      await expect.poll(() => reveals.evaluateAll((nodes) => nodes.every((node) => node.classList.contains("aos-animate")))).toBe(true);
      await page.mouse.wheel(0, 300);
      expect(await reveals.first().evaluate((node) => (node as HTMLElement).style.opacity)).toBe("");
    } finally {
      releaseImage();
    }
  });

  test("team reveal waits for the client navigation curtain", async ({ page }) => {
    await page.goto("/academy");
    await expect(page.locator(".intro")).toHaveCSS("visibility", "hidden");
    await page.getByRole("button", { name: "About Us", exact: true }).click();
    await page.getByRole("link", { name: "Meet the Team", exact: true }).click();
    await page.waitForURL("**/team");
    const curtain = page.locator(".route-curtain:visible").last();
    await expect(curtain).toBeVisible();
    const reveals = page.locator("[data-aos-wait-for-images]");
    await expect.poll(() => reveals.evaluateAll((nodes) => nodes.every((node) => !node.classList.contains("aos-animate")))).toBe(true);
    await expect(curtain).not.toBeVisible();
    await expect.poll(() => reveals.evaluateAll((nodes) => nodes.every((node) => node.classList.contains("aos-animate")))).toBe(true);
  });
});

for (const locale of ["en-US", "ar-SA", "de-DE"]) {
  for (const width of [390, 1440]) {
    test(`compact team artwork fits: ${locale}, ${width}px`, async ({ browser }) => {
      const context = await browser.newContext({ locale, viewport: { width, height: 950 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto("/team");
      await expect(page.locator("html")).toHaveAttribute("lang", locale.slice(0, 2));
      const visual = page.locator("[data-team-visual]");
      await expect(visual.locator("img")).toHaveCount(1);
      await expect.poll(() => visual.locator("img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await expect(visual.locator("a")).toHaveCount(0);
      const visualBounds = await visual.boundingBox();
      expect(visualBounds!.height).toBeLessThanOrEqual(width < 640 ? 288.5 : 432.5);
      const hero = await page.locator("main section").first().boundingBox();
      expect(hero!.height).toBeLessThanOrEqual(width < 640 ? 820 : 620);
      const mission = page.locator("[data-team-mission]");
      const title = "We're here to define the future of OSA + TMD.";
      const description = "Equip practices to deliver OSA + TMD care with confidence.";
      const entries = locale === "en-US" ? {} : JSON.parse(readFileSync(`public/locales/${locale.slice(0, 2)}.json`, "utf8"));
      await expect(mission.locator("h2")).toHaveText(entries[title] ?? title);
      await expect(mission.locator("p").last()).toHaveText(entries[description] ?? description);
      const headingBounds = await mission.locator("h2").boundingBox();
      const bodyBounds = await mission.locator("p").last().boundingBox();
      const headingEdge = locale === "ar-SA" ? headingBounds!.x + headingBounds!.width : headingBounds!.x;
      const bodyEdge = locale === "ar-SA" ? bodyBounds!.x + bodyBounds!.width : bodyBounds!.x;
      expect(Math.abs(headingEdge - bodyEdge)).toBeLessThan(1);
      expect(bodyBounds!.y).toBeGreaterThan(headingBounds!.y + headingBounds!.height);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await context.close();
    });
  }
}
