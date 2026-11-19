import { test, expect, type BrowserContext } from "@playwright/test";
import { createDefaultDocument, validateDocument, type CmsDocument } from "../src/lib/cms/model";
import { builderCss } from "../src/lib/cms/builder";

// Exercise the real editor, preview, validation and published renderer against an
// isolated in-memory content service. These tests never modify production data.
test.use({ trace: "off", reducedMotion: "reduce" });

let saved: CmsDocument;
let published: CmsDocument;
let version: number;
async function contentService(context: BrowserContext) {
  await context.route("**/api/control/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.pathname === "/api/control/session") return json({ authenticated: request.method() !== "DELETE" });
    if (url.pathname === "/api/control/public") return json({ document: published });
    if (url.pathname === "/api/control/content") {
      if (request.method() === "GET") return json({ document: url.searchParams.get("slot") === "published" ? published : saved, version: String(version) });
      const body = request.postDataJSON();
      if (body.version !== String(version)) return json({ error: "Another admin saved changes." }, 409);
      try { validateDocument(body.document); } catch (error) { return json({ error: String(error) }, 400); }
      saved = structuredClone(body.document);
      if (body.slot === "published") published = structuredClone(saved);
      return json({ version: String(++version) });
    }
    return json({ error: "Not available in isolated tests" }, 404);
  });
}
test.beforeEach(async ({ context }) => {
  saved = createDefaultDocument(); published = structuredClone(saved); version = 1;
  await contentService(context);
});
async function openBuilder(page: import("@playwright/test").Page) {
  await page.goto("/control");
  await expect(page.getByRole("heading", { name: "Edit website", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Design & sections", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Page builder" });
  await expect(panel.getByRole("button", { name: "Home Hero", exact: true })).toBeVisible();
  return panel;
}

test("design controls change desktop and mobile backgrounds and spacing; undo and redo restore them", async ({ page }) => {
  const panel = await openBuilder(page);
  const preview = page.frameLocator('iframe[title="Editable website preview"]');
  await panel.getByRole("button", { name: "Home Hero", exact: true }).click();
  await panel.getByLabel("Background type").selectOption("gradient");
  await panel.getByLabel("Gradient start").fill("#123456");
  await panel.getByLabel("Gradient end").fill("#abcdef");
  await panel.getByLabel("Padding top", { exact: true }).fill("64");
  const hero = preview.locator('[data-cms-section="home-hero-0"] > section');
  await expect(hero).toHaveCSS("padding-top", "64px");
  await expect(hero).toHaveCSS("background-image", /rgb\(18, 52, 86\).*rgb\(171, 205, 239\)/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(hero).not.toHaveCSS("padding-top", "64px");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(hero).toHaveCSS("padding-top", "64px");
  await panel.getByRole("button", { name: "Mobile", exact: true }).click();
  await panel.getByLabel("Padding top", { exact: true }).fill("12");
  await page.getByLabel("Preview size", { exact: true }).selectOption("mobile");
  await expect(hero).toHaveCSS("padding-top", "12px");
  await page.getByLabel("Preview size", { exact: true }).selectOption("desktop");
  await expect(hero).toHaveCSS("padding-top", "64px");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved securely.")).toBeVisible();
  expect(saved.builder?.["/"].styles).toBeDefined();
  expect(published.builder).toBeUndefined();
  await page.screenshot({ path: test.info().outputPath("builder-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("builder-mobile.png"), fullPage: true });
});

test("new sections support multiline text, lists, cards, images and buttons and publish to another browser", async ({ page, browser }) => {
  const panel = await openBuilder(page);
  const preview = page.frameLocator('iframe[title="Editable website preview"]');
  await panel.getByLabel("Section layout").selectOption("list");
  await panel.getByRole("button", { name: "Add section", exact: true }).click();
  await panel.getByLabel("Section name", { exact: true }).fill("Patient app benefits");
  await panel.getByLabel("Heading content", { exact: true }).fill("Stay connected with your patients");
  await panel.getByLabel("List item 1", { exact: true }).fill("Appointment reminders");
  await panel.getByRole("button", { name: "Add list item", exact: true }).click();
  await panel.getByLabel("List item 3", { exact: true }).fill("Patient education");
  await panel.getByLabel("Content block type").selectOption("text");
  await panel.getByRole("button", { name: "Add content block", exact: true }).click();
  await panel.getByLabel("Text content", { exact: true }).fill("First paragraph\nSecond paragraph");
  await expect(preview.getByText("First paragraph\nSecond paragraph", { exact: true })).toHaveCSS("white-space", "pre-line");
  await panel.getByLabel("Content block type").selectOption("cards");
  await panel.getByRole("button", { name: "Add content block", exact: true }).click();
  await panel.getByLabel("Card 1", { exact: true }).fill("A connected care journey");
  await expect(preview.getByText("A connected care journey", { exact: true })).toBeVisible();
  await panel.getByLabel("Content block type").selectOption("video");
  await panel.getByRole("button", { name: "Add content block", exact: true }).click();
  await panel.getByLabel("Video URL", { exact: true }).fill("/assets/videos/osa-tmd-consultation.mp4");
  await expect(preview.locator('video[src="/assets/videos/osa-tmd-consultation.mp4"]')).toBeVisible();
  await panel.getByLabel("Content block type").selectOption("image");
  await panel.getByRole("button", { name: "Add content block", exact: true }).click();
  await panel.getByLabel("Image URL", { exact: true }).fill("/assets/beyonn-logo.png");
  await panel.getByLabel("Media description", { exact: true }).last().fill("Beyonn test image");
  await expect(preview.getByRole("img", { name: "Beyonn test image", exact: true })).toBeVisible();
  await panel.getByLabel("Content block type").selectOption("button");
  await panel.getByRole("button", { name: "Add content block", exact: true }).click();
  await panel.getByLabel("Button content", { exact: true }).fill("Explore the app");
  await panel.getByLabel("Button destination", { exact: true }).fill("/patient-app");
  await expect(preview.getByRole("link", { name: "Explore the app", exact: true })).toHaveAttribute("href", "/patient-app");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved securely.")).toBeVisible();
  expect(published.builder).toBeUndefined();
  await page.reload();
  await expect(preview.getByRole("heading", { name: "Stay connected with your patients", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish now", exact: true }).click();
  await expect(page.getByText("Published to your website.")).toBeVisible();
  const visitor = await browser.newContext({ reducedMotion: "reduce" });
  await contentService(visitor);
  try {
    const live = await visitor.newPage(); await live.goto("/");
    await expect(live.getByRole("heading", { name: "Stay connected with your patients", exact: true })).toBeVisible();
    await expect(live.getByText("Patient education", { exact: true }).last()).toBeVisible();
    await expect(live.getByRole("link", { name: "Explore the app", exact: true })).toHaveAttribute("href", "/patient-app");
  } finally { await visitor.close(); }
});

test("sections can be placed, duplicated, hidden and deleted without affecting other content", async ({ page }) => {
  const panel = await openBuilder(page);
  const preview = page.frameLocator('iframe[title="Editable website preview"]');
  await panel.getByLabel("Insert at", { exact: true }).selectOption("welcome");
  await panel.getByLabel("Position", { exact: true }).selectOption("after");
  await panel.getByRole("button", { name: "Add section", exact: true }).click();
  await panel.getByLabel("Heading content", { exact: true }).fill("Inserted section");
  await expect(preview.locator('[data-cms-section="welcome"] + section').getByRole("heading", { name: "Inserted section" })).toBeVisible();
  await panel.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Inserted section", exact: true })).toHaveCount(2);
  await panel.getByRole("button", { name: "Hide section", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Inserted section", exact: true })).toHaveCount(1);
  await panel.getByRole("button", { name: "Delete section", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Inserted section", exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await panel.getByRole("button", { name: "Edit hidden New text section", exact: true }).click();
  await panel.getByRole("button", { name: "Show section", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Inserted section", exact: true })).toHaveCount(2);
});

test("existing collections accept new entries; arbitrary existing lists accept additional lines", async ({ page }) => {
  const panel = await openBuilder(page);
  const preview = page.frameLocator('iframe[title="Editable website preview"]');
  await panel.getByRole("button", { name: "Content", exact: true }).click();
  await panel.getByLabel("Content collection").selectOption("workshopContent");
  await panel.locator('summary').filter({ hasText: /^Takeaways \(/ }).click();
  await panel.getByRole("button", { name: "Add Takeaway", exact: true }).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved securely.")).toBeVisible();
  expect((saved.data.workshopContent as { takeaways: unknown[] }).takeaways).toHaveLength(5);
  const list = preview.locator('#platform [data-cms-list]').first();
  await list.locator('li').first().click();
  await expect(panel.getByRole("heading", { name: "Design selected element" })).toBeVisible();
  await panel.getByRole("button", { name: "Add item", exact: true }).click();
  await panel.getByLabel("Item 1", { exact: true }).fill("A new learning resource");
  await expect(list.getByText("A new learning resource", { exact: true })).toBeVisible();
});

test("publishing conflicts keep unsaved layout edits available", async ({ page }) => {
  const panel = await openBuilder(page);
  await panel.getByRole("button", { name: "Add section", exact: true }).click();
  version++;
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Another admin saved changes" })).toContainText("Another admin saved changes");
  await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
  expect(saved.builder).toBeUndefined();
});

test("layout schema rejects unsafe CSS, malformed blocks, bad URLs and oversized spacing", () => {
  const doc = createDefaultDocument();
  expect(() => validateDocument(doc)).not.toThrow();
  doc.builder = { "/": { styles: { '[data-cms-section="welcome"]': { desktop: { background: "#123456", gradient: { from: "#123456", to: "#ffffff", angle: 90 }, paddingTop: 40 }, mobile: { paddingTop: 12 } } }, sections: [{ id: "new-section", label: "Test", anchor: "welcome", position: "after", enabled: true, blocks: [{ id: "text-1", type: "text", text: "New content" }] }] } };
  expect(() => validateDocument(doc)).not.toThrow();
  expect(builderCss(doc.builder["/"])).toContain("@media(max-width:640px)");
  for (const mutation of [
    (d: CmsDocument) => { d.builder!["/"].styles = { 'body{display:none}': { desktop: { paddingTop: 10 } } }; },
    (d: CmsDocument) => { d.builder!["/"].styles!['[data-cms-section="welcome"]'].desktop!.background = '#fff;}</style><script>alert(1)</script>'; },
    (d: CmsDocument) => { d.builder!["/"].styles!['[data-cms-section="welcome"]'].desktop!.paddingTop = -10; },
    (d: CmsDocument) => { d.builder!["/"].styles!['[data-cms-section="welcome"]'].desktop!.gap = 9999; },
    (d: CmsDocument) => { d.builder!["/"].sections![0].blocks[0] = { id: "bad", type: "button", text: "Bad", href: "javascript:alert(1)" }; },
    (d: CmsDocument) => { d.builder!["/"].sections![0].blocks.push({ ...d.builder!["/"].sections![0].blocks[0] }); },
  ]) { const invalid = structuredClone(doc); mutation(invalid); expect(() => validateDocument(invalid)).toThrow(); }
});

test("uploaded media is added atomically to its block and library; unsupported files are rejected", async ({ page, context }) => {
  const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  await context.route("https://cms-test-upload.example/upload", (route) => route.fulfill({ status: 204 }));
  await context.route("**/api/control/media/*", (route) => {
    if (route.request().method() === "GET") return route.fulfill({ contentType: "image/png", body: image });
    const body = route.request().postDataJSON();
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(body.action === "prepare" ? { url: "https://cms-test-upload.example/upload", fields: {} } : { id: new URL(route.request().url()).pathname.split("/").at(-1) }) });
  });
  const panel = await openBuilder(page);
  await panel.getByLabel("Section layout").selectOption("image");
  await panel.getByRole("button", { name: "Add section", exact: true }).click();
  await panel.getByLabel("Upload image", { exact: true }).setInputFiles({ name: "wrong.txt", mimeType: "text/plain", buffer: Buffer.from("wrong") });
  await expect(panel.getByRole("alert")).toContainText("supported file");
  await panel.getByLabel("Upload image", { exact: true }).setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: image });
  await expect(panel.getByLabel("Image URL", { exact: true })).toHaveValue(/^cms-media:/);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved securely.")).toBeVisible();
  expect(saved.media).toHaveLength(1);
  expect(saved.builder?.["/"].sections?.[0].blocks[1].src).toBe(`cms-media:${saved.media[0].id}`);
  expect(published.media).toHaveLength(0);
});

test("page sections and designs remain scoped to the selected route and survive hiding an anchor", async ({ page }) => {
  await openBuilder(page);
  await page.getByRole("button", { name: /^Page:/ }).click();
  await page.getByRole("group", { name: "Website pages" }).getByRole("button", { name: "Meet the Team", exact: true }).click();
  await page.getByRole("button", { name: "Design & sections", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Page builder" });
  await expect(panel.getByRole("button", { name: "Page introduction", exact: true })).toBeVisible();
  await panel.getByLabel("Insert at", { exact: true }).selectOption("section-0");
  await panel.getByLabel("Position", { exact: true }).selectOption("after");
  await panel.getByRole("button", { name: "Add section", exact: true }).click();
  await panel.getByLabel("Heading content", { exact: true }).fill("Team-specific addition");
  const preview = page.frameLocator('iframe[title="Editable website preview"]');
  await expect(preview.getByRole("heading", { name: "Team-specific addition" })).toBeVisible();
  await panel.getByText("Reorder or hide existing sections", { exact: true }).click();
  await panel.locator(".ctl-builder-existing").first().getByRole("button", { name: "Hide", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Team-specific addition" })).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved securely.")).toBeVisible();
  expect(saved.builder?.["/team"].sections?.[0].blocks[0].text).toBe("Team-specific addition");
  expect(saved.builder?.["/"]).toBeUndefined();
  await page.getByRole("button", { name: /^Page:/ }).click();
  await page.getByRole("group", { name: "Website pages" }).getByRole("button", { name: "Homepage", exact: true }).click();
  await expect(preview.getByRole("heading", { name: "Team-specific addition" })).toHaveCount(0);
});
