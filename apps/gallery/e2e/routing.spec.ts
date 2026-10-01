/** Routes, titles, links and the home cards. */
import { test, expect } from "@playwright/test";

test("unknown routes render a not-found page", async ({ page }) => {
  for (const path of ["/nope", "/visuals/metrics", "/visuals/charts/pie"]) {
    await page.goto(path);
    await expect(page.locator("h1"), path).toHaveText("Page not found");
    await expect(page).toHaveTitle("Not found — Cremona");
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
  }
  // suggestions from the path words, and a way back
  await expect(page.getByRole("heading", { name: "Maybe one of these" })).toBeVisible();
  await page.getByRole("link", { name: "Back to all visuals" }).click();
  await expect(page.locator("h1")).toHaveText("All visual compositions");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("document title names the block", async ({ page }) => {
  await page.goto("/visuals/files/simple");
  await expect(page.locator("h1")).toHaveText("Simple");
  await expect(page).toHaveTitle("Simple — Files — Cremona");
});

test("home cards: one stretched link each, no nested interactive content", async ({ page }) => {
  await page.goto("/");
  await page.locator("h1").waitFor();
  await expect(page.locator("main a a, main a button")).toHaveCount(0);
  // the previews (which render links and buttons of their own) are inert
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll("[data-thumbnail]")].filter(
          (el) => !(el as HTMLElement).inert,
        ).length,
    ),
  ).toBe(0);
  // clicking anywhere on the card follows its link
  const card = page
    .locator("main li")
    .filter({ has: page.getByRole("link", { name: "Stat Card", exact: true }) });
  await card.locator("[data-thumbnail]").click({ position: { x: 20, y: 20 }, force: true });
  await expect(page.locator("h1")).toHaveText("Stat Card");
});

test("Ctrl/⌘-click on a link opens a new tab instead of navigating", async ({ page, context }) => {
  await page.goto("/");
  await page.locator("h1").waitFor();
  const link = page.getByRole("link", { name: "Stat Card", exact: true });
  const [tab] = await Promise.all([
    context.waitForEvent("page"),
    link.click({ modifiers: [process.platform === "darwin" ? "Meta" : "Control"] }),
  ]);
  // the new tab starts at about:blank: wait for the navigation, not the first load
  await expect(tab).toHaveURL(/\/visuals\/metrics\/stat-card$/, { timeout: 15000 });
  // the original tab stayed on the home page
  await expect(page.locator("h1")).toHaveText("All visual compositions");
});

test("storage blocked: the gallery still renders", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("All visual compositions");
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  expect(errors).toEqual([]);
  await context.close();
});
