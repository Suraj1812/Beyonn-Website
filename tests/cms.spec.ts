import { test, expect, type APIRequestContext } from "@playwright/test";

// Write tests are opt-in and should target the Auth emulator or a dedicated test project.
// No account credentials are included in source or browser storage.
const account =
  process.env.CMS_TEST_EMAIL && process.env.CMS_TEST_PASSWORD
    ? {
        email: process.env.CMS_TEST_EMAIL,
        password: process.env.CMS_TEST_PASSWORD,
      }
    : undefined;
const origin = "http://localhost:3100";
test.use({ trace: "off" });
test("control is isolated and private APIs reject anonymous access", async ({
  page,
  request,
}) => {
  await page.goto("/control");
  await expect(
    page.getByRole("heading", { name: "Sign in to your account" }),
  ).toBeVisible();
  await expect(page.getByLabel("Admin ID")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await expect(page.locator("header nav")).toHaveCount(0);
  expect((await request.get("/api/control/content")).status()).toBe(401);
  expect(
    (
      await request.put("/api/control/content", {
        headers: { Origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/control/session", {
        headers: { Origin: origin },
        data: { email: "invalid" },
      })
    ).status(),
  ).toBe(400);
});

test("admin login page fits mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/control");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test.describe("authenticated CMS publishing", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(
    !account || process.env.CMS_E2E_WRITE !== "1",
    "Set CMS_TEST_EMAIL, CMS_TEST_PASSWORD and CMS_E2E_WRITE=1 for an isolated backend.",
  );
  let admin: APIRequestContext;
  let original: unknown;
  let draft: unknown;
  let version = "";
  test.beforeAll(async ({ playwright }) => {
    admin = await playwright.request.newContext({
      baseURL: origin,
      extraHTTPHeaders: { Origin: origin },
    });
    const login = await admin.post("/api/control/session", { data: account });
    expect(login.status()).toBe(200);
    original = (await (await admin.get("/api/control/public")).json()).document;
    const saved = await (
      await admin.get("/api/control/content?slot=draft")
    ).json();
    draft = saved.document ?? original;
    version = saved.version ?? "";
  });
  test.afterAll(async () => {
    if (!admin || !original) return;
    const current = await (
      await admin.get("/api/control/content?slot=draft")
    ).json();
    const restore = await admin.put("/api/control/content", {
      data: {
        slot: "published",
        document: original,
        version: current.version ?? "",
      },
    });
    expect(restore.status()).toBe(200);
    const restored = await restore.json();
    const restoreDraft = await admin.put("/api/control/content", {
      data: { slot: "draft", document: draft, version: restored.version },
    });
    expect(restoreDraft.status()).toBe(200);
    await admin.delete("/api/control/session");
    await admin.dispose();
  });
  test("drafts stay private; publish reaches a second browser and server metadata", async ({
    browser,
  }) => {
    const doc = structuredClone(original) as {
      data: {
        pages: Record<
          string,
          { title: string; description: string; sections: unknown[] }
        >;
      };
      seo: Record<string, { title: string; description: string }>;
    };
    doc.data.pages["cms-integration-check"] = {
      title: "CMS integration check",
      description: "Private until publication",
      sections: [],
    };
    doc.seo["/cms-integration-check"] = {
      title: "CMS integration title",
      description: "CMS integration description",
    };
    const save = await admin.put("/api/control/content", {
      data: { slot: "draft", document: doc, version },
    });
    expect(save.status(), await save.text()).toBe(200);
    version = (await save.json()).version;
    const anonymous = await browser.newContext();
    expect((await anonymous.request.get("/api/control/content")).status()).toBe(
      401,
    );
    const unpublished = await (
      await anonymous.request.get("/api/control/public")
    ).json();
    expect(
      unpublished.document.data.pages["cms-integration-check"],
    ).toBeUndefined();
    const publish = await admin.put("/api/control/content", {
      data: { slot: "published", document: doc, version },
    });
    expect(publish.status(), await publish.text()).toBe(200);
    version = (await publish.json()).version;
    const page = await anonymous.newPage();
    await page.goto("/cms-integration-check");
    await expect(
      page.getByRole("heading", { name: "CMS integration check", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/CMS integration title/);
    await anonymous.close();
  });
  test("rejects stale drafts, unsafe links and malformed sections", async () => {
    const valid = structuredClone(original) as {
      data: {
        site: { url: string };
        pages: Record<string, { sections: unknown[] }>;
      };
    };
    const stale = await admin.put("/api/control/content", {
      data: { slot: "draft", document: valid, version: "outdated" },
    });
    expect(stale.status()).toBe(409);
    valid.data.site.url = "javascript:alert(1)";
    expect(
      (
        await admin.put("/api/control/content", {
          data: { slot: "draft", document: valid, version },
        })
      ).status(),
    ).toBe(400);
    valid.data.site.url = "https://beyonn.com";
    const first = Object.keys(valid.data.pages)[0];
    valid.data.pages[first].sections = [null];
    expect(
      (
        await admin.put("/api/control/content", {
          data: { slot: "draft", document: valid, version },
        })
      ).status(),
    ).toBe(400);
  });
  test("visual edits stay private, survive saving a draft and fit mobile", async ({ browser }) => {
    const context = await browser.newContext({ storageState: await admin.storageState() });
    try {
      const page = await context.newPage();
      await page.goto("/control");
      await expect(page.getByRole("heading", { name: "Edit website" })).toBeVisible();
      await expect(page.getByText("More tools", { exact: true })).toHaveCount(0);
      const pageSelect = page.getByLabel("Page", { exact: true });
      await pageSelect.selectOption("/cms-integration-check");
      const editor = page.frameLocator('iframe[title="Editable website preview"]');
      await editor.locator('h1[data-cms-edit-text]').click();
      await page.getByLabel("Content", { exact: true }).fill("Visual editor check");
      await page.getByLabel("Text color").fill("#3177bf");
      await page.getByLabel("Text size (px)").fill("36");
      await page.getByRole("button", { name: "Apply", exact: true }).click();
      const edited = editor.getByRole("heading", { name: "Visual editor check" });
      await expect(edited).toHaveCSS("font-size", "36px");
      await expect(edited).toHaveCSS("color", "rgb(49, 119, 191)");
      const publicPage = await context.request.get("/cms-integration-check");
      expect(await publicPage.text()).not.toContain("Visual editor check");
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await expect(page.getByText("Draft saved securely.", { exact: true })).toBeVisible();
      await page.reload();
      await pageSelect.selectOption("/cms-integration-check");
      await expect(edited).toBeVisible();
      await expect(edited).toHaveCSS("font-size", "36px");
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    } finally {
      await context.close();
    }
  });
  test("uploaded files require authorization and a valid signature", async ({
    request,
  }) => {
    const id = "00000000-0000-4000-8000-000000000000";
    expect(
      (
        await request.put(`/api/control/media/${id}`, {
          headers: { Origin: origin, "Content-Type": "image/png" },
          data: Buffer.from("invalid image file"),
        })
      ).status(),
    ).toBe(401);
    expect(
      (
        await admin.put(`/api/control/media/${id}`, {
          headers: { "Content-Type": "image/png" },
          data: Buffer.from("invalid image file"),
        })
      ).status(),
    ).toBe(415);
    expect((await request.get(`/api/control/media/${id}`)).status()).toBe(404);
  });
});
