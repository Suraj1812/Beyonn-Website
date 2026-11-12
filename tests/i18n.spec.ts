import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { languages, translateText, type Catalog, type Language } from "../src/lib/i18n/languages";

const catalog = (language: Language): Catalog => language === "en" ? {} : JSON.parse(readFileSync(`public/locales/${language}.json`, "utf8"));
const source: string[] = JSON.parse(readFileSync("src/lib/i18n/messages.json", "utf8"));
const originalHeading = "The OSA + TMD Program Your Team Can Run";

async function choose(page: Page, language: Language) {
  const root = page.locator("[data-language-switcher]");
  if (!await root.getByRole("combobox").count()) await root.locator("[data-language-trigger]").click();
  await root.getByRole("combobox").selectOption(language);
  await expect(page.locator("html")).toHaveAttribute("lang", language);
}

test("every advertised language has a complete, nonempty local catalog", () => {
  expect(languages.length).toBeGreaterThanOrEqual(21);
  for (const { code } of languages) {
    if (code === "en") continue;
    const entries = catalog(code);
    expect(source.filter((key) => typeof entries[key] !== "string" || !entries[key].trim()), code).toEqual([]);
  }
});

test.describe("Hindi device", () => {
  test.use({ locale: "hi-IN", viewport: { width: 390, height: 844 } });

  test("automatically translates mobile pages and accessible labels", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await expect(page.locator("h1")).toHaveText(catalog("hi")[originalHeading]);
    await expect(page.locator("[data-language-trigger]")).toHaveAccessibleName(/भाषा/);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("English preference survives navigation and reload; device language can be restored", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await choose(page, "en");
    await page.reload();
    await expect(page.locator("h1")).toHaveText(originalHeading);
    await page.goto("/patients");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await choose(page, "hi");
    await expect(page.locator("h1")).not.toContainText("Your");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  });

  test("changing language preserves screening answers and translates dynamic results", async ({ page }) => {
    await page.goto("/patients");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    for (let index = 0; index < 12; index++) {
      await page.locator(`input[name="check-${index}"]`).first().locator("..").click();
    }
    const result = page.locator("#quick-check [role=status]");
    await expect(result).toBeVisible();
    await expect(result.locator("h3")).toHaveText(catalog("hi")["What Your Answers Reveal"]);
    await page.evaluate(() => scrollTo(0, 0));
    await choose(page, "en");
    await expect(result.locator("h3")).toHaveText("What Your Answers Reveal");
    await expect(page.locator("#quick-check input:checked")).toHaveCount(12);
  });
});

for (const { code } of languages) {
  if (code === "en") continue;
  test(`device detection and complete heading: ${code}`, async ({ browser }) => {
    const context = await browser.newContext({ locale: code });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await expect(page.locator("h1")).toHaveText(catalog(code)[originalHeading]);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const cta = await page.locator("header a.btn").boundingBox();
    expect(cta).not.toBeNull();
    expect(cta!.x + cta!.width).toBeLessThanOrEqual(1280);
    await expect(page.locator("html")).toHaveAttribute("dir", code === "ar" || code === "ur" ? "rtl" : "ltr");
    await context.close();
  });
}

test("unsupported device languages fall back to English", async ({ browser }) => {
  const context = await browser.newContext({ locale: "fi-FI" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(originalHeading);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await context.close();
});

test("Arabic stays readable without horizontal overflow on mobile", async ({ browser }) => {
  const context = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of ["/", "/patients", "/resources"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.close();
});

test("storage restrictions do not break device detection", async ({ browser }) => {
  const context = await browser.newContext({ locale: "hi-IN" });
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await choose(page, "en");
  await context.close();
});

test("a failed catalog keeps readable English and offers a working retry", async ({ browser }) => {
  const context = await browser.newContext({ locale: "hi-IN" });
  const page = await context.newPage();
  await page.route("**/locales/hi.json", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(originalHeading);
  await page.locator("[data-language-trigger]").click();
  await expect(page.getByText("Translation could not be loaded. Please try again.")).toBeVisible();
  await page.unroute("**/locales/hi.json");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await context.close();
});


test("all content routes and the 404 page translate their main heading", async ({ browser }) => {
  test.setTimeout(90_000);
  const english = await browser.newContext({ locale: "en-US" });
  const hindi = await browser.newContext({ locale: "hi-IN" });
  const [original, translated] = await Promise.all([english.newPage(), hindi.newPage()]);
  const response = await original.request.get("/sitemap.xml");
  const xml = await response.text();
  const routes = [...new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
    .concat(["/privacy", "/terms", "/hipaa", "/portal", "/partner-login", "/invalid-i18n-test"]))];
  const errors: string[] = [];
  translated.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    await Promise.all([original.goto(route), translated.goto(route)]);
    const heading = (await original.locator("h1").innerText()).replace(/\s+/g, " ").trim();
    expect(Object.prototype.hasOwnProperty.call(catalog("hi"), heading), route).toBe(true);
    await expect(translated.locator("html"), route).toHaveAttribute("lang", "hi");
    await expect(translated.locator("h1"), route).toHaveText(translateText(heading, catalog("hi")));
  }
  expect(errors).toEqual([]);
  await Promise.all([english.close(), hindi.close()]);
});

test("browser title translates and returns to the English original", async ({ browser }) => {
  const context = await browser.newContext({ locale: "hi-IN" });
  const page = await context.newPage();
  const title = "Dental Sleep Medicine Program for Your Team | OSA + TMD | Beyonn";
  await page.goto("/");
  await expect(page).toHaveTitle(catalog("hi")[title]);
  await choose(page, "en");
  await expect(page).toHaveTitle(title);
  await context.close();
});


test("long German labels fit the tablet header and workshop banner", async ({ browser }) => {
  const context = await browser.newContext({ locale: "de-DE", viewport: { width: 1024, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  const action = await page.locator("header a.btn").boundingBox();
  expect(action!.x + action!.width).toBeLessThanOrEqual(1024);
  await expect(page.getByRole("button", { name: catalog("de")["Open menu"], exact: true })).toBeVisible();
  await context.close();
});


test("a late device translation cannot overwrite an explicit English selection", async ({ browser }) => {
  const context = await browser.newContext({ locale: "hi-IN" });
  const page = await context.newPage();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/locales/hi.json", async (route) => { await gate; await route.continue(); });
  await page.goto("/");
  await choose(page, "en");
  const response = page.waitForResponse("**/locales/hi.json");
  release();
  await response;
  await expect(page.locator("h1")).toHaveText(originalHeading);
  expect(await page.evaluate(() => localStorage.getItem("beyonn:language"))).toBe("en");
  await context.close();
});

for (const body of ["{}", '{"Language":"Hindi","Bad":42}']) {
  test(`invalid translation assets leave the English page usable: ${body}`, async ({ browser }) => {
    const context = await browser.newContext({ locale: "hi-IN" });
    const page = await context.newPage();
    await page.route("**/locales/hi.json", (route) => route.fulfill({ contentType: "application/json", body }));
    await page.goto("/");
    await page.locator("[data-language-trigger]").click();
    await expect(page.getByText("Translation could not be loaded. Please try again.")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(originalHeading);
    await context.close();
  });
}

test("a stalled catalog times out and lets the visitor retry", async ({ browser }) => {
  const context = await browser.newContext({ locale: "hi-IN" });
  const page = await context.newPage();
  await page.clock.install();
  await page.route("**/locales/hi.json", () => {});
  const requested = page.waitForRequest("**/locales/hi.json");
  await page.goto("/");
  await requested;
  await page.clock.fastForward(15_100);
  await page.locator("[data-language-trigger]").click();
  await expect(page.getByText("Translation could not be loaded. Please try again.")).toBeVisible();
  await expect(page.locator("h1")).toHaveText(originalHeading);
  await page.unroute("**/locales/hi.json");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await context.close();
});


test("translated screening preserves the three observed breathing symptoms", async () => {
  const pins = JSON.parse(readFileSync("scripts/i18n-clinical-checks.json", "utf8"));
  for (const { code } of languages) {
    if (code === "en") continue;
    const translated = catalog(code)[pins.breathingQuestion.source];
    for (const term of Object.values(pins.breathingQuestion.concepts[code]) as string[]) expect(translated, `${code}: ${term}`).toContain(term);
  }
});

test("dictionary prototype names and replacement tokens remain ordinary text", () => {
  for (const key of ["constructor", "toString", "__proto__"]) expect(translateText(key, {})).toBe(key);
  expect(translateText("Cost", { Cost: "$& costs $50" })).toBe("$& costs $50");
});

test("client navigation keeps the selected language on newly streamed content", async ({ page }) => {
  await page.goto("/");
  await choose(page, "hi");
  await page.keyboard.press("Escape");
  await page.locator('header a[href="/resources"]').click();
  await expect(page).toHaveURL(/\/resources$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await page.locator('main a[href^="/resources/"]').first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(page).toHaveURL(/\/resources\/.+/);
  // Cache Components retains old routes in hidden Activity trees.
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator("h1:visible")).toContainText(/[\u0900-\u097F]/);
});

test("resizing an open tablet menu releases its page scroll lock", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
});
