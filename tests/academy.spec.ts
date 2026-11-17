import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { academyTiers } from "../src/content/academy";
import { languages } from "../src/lib/i18n/languages";

test("Academy renders the full curriculum and disclosures work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/academy#blueprint");
  const curriculum = page.locator("#blueprint");
  await expect(curriculum.locator("article")).toHaveCount(3);
  await expect(curriculum.locator("details")).toHaveCount(14);
  await expect(curriculum.locator("details li")).toHaveCount(52);
  for (const [index, count] of [16, 22, 14].entries()) {
    await expect(curriculum.locator("article").nth(index).locator("li")).toHaveCount(count);
  }
  const unit = curriculum.locator("details").nth(1);
  await unit.locator("summary").click();
  await expect(unit).toHaveAttribute("open", "");
  await unit.locator("summary").press("Enter");
  await expect(unit).not.toHaveAttribute("open", "");
  await expect(page.locator("#master-success")).toContainText("5 slots per week");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("every Academy lesson and tier heading switches to each supported language", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/academy");
  const expectedLessons = academyTiers.flatMap((tier) => tier.units.flatMap((unit) => unit.lessons.map(({ title }) => title)));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const { code } of languages) {
    if (code === "en") continue;
    const entries = JSON.parse(readFileSync(`public/locales/${code}.json`, "utf8"));
    const switcher = page.locator("[data-language-switcher]");
    if (!await switcher.getByRole("combobox").count()) await switcher.locator("[data-language-trigger]").click();
    await switcher.getByRole("combobox").selectOption(code);
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await expect(page.locator("#blueprint article h3")).toHaveText(academyTiers.map(({ title }) => entries[title]));
    await expect(page.locator("#blueprint details li > span:last-child")).toHaveText(expectedLessons.map((title) => entries[title]));
    await expect(page.locator("#master-success").getByRole("heading", { name: entries["The doctor's voice sets the standard"], exact: true })).toBeAttached();
    await page.keyboard.press("Escape");
    await page.goto("/");
    await expect(page.locator("#blueprint h4")).toHaveText(academyTiers.map(({ title }) => entries[title]));
    await expect(page.getByRole("heading", { name: entries["What Others Are Saying..."], exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: entries["We enable your team to do it."], exact: true })).toBeAttached();
    await page.goto("/academy");
  }
  expect(errors).toEqual([]);
});
