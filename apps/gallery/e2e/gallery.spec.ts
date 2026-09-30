/** Visual smoke test: screenshots + layout assertions (sidebar vs content). */
import { test, expect } from "@playwright/test";

test("home: sidebar sits beside content, not above", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-slot="sidebar-trigger"], header').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const sidebar = page.locator('[data-slot="sidebar-container"]');
  const main = page.locator("main");
  const sb = await sidebar.boundingBox();
  const mb = await main.boundingBox();
  expect(sb).toBeTruthy();
  expect(mb).toBeTruthy();
  // sidebar must NOT overlap the main content area horizontally
  expect(sb!.x + sb!.width).toBeLessThanOrEqual(mb!.x + 2);
  // the h1 must be visible (not covered)
  const h1 = page.locator("h1");
  await expect(h1).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("home.png"), fullPage: false });
});

test("block page renders all variant frames", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await page.waitForTimeout(1500);
  await expect(page.locator("h1")).toContainText("Stat Card");
  const frames = page.locator(".group\\/preview");
  expect(await frames.count()).toBe(10);
  await page.screenshot({ path: test.info().outputPath("stat-card.png") });
});

test("dark mode + theme switch apply classes", async ({ page }) => {
  await page.goto("/");
  await page.locator('button[aria-label="Toggle theme"]').click();
  await page.waitForTimeout(300);
  const dark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  expect(dark).toBe(true);
  await page.locator('button[aria-label="Pick theme"]').click();
  await page.getByRole("menuitem", { name: /Claude\+/ }).click();
  await page.waitForTimeout(200);
  const theme = await page.evaluate(() =>
    document.documentElement.classList.contains("theme-claude-plus"),
  );
  expect(theme).toBe(true);
  await page.screenshot({ path: test.info().outputPath("dark-claude.png") });
});

test("search palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  await page.locator('button[aria-label="Toggle theme"]').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Search visuals...").fill("kanban");
  await page.screenshot({ path: test.info().outputPath("search.png") });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  await expect(page.locator("h1")).toContainText("Kanban");
});

test("preview stages keep their golden height", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await expect(page.locator("h1")).toContainText("Stat Card");
  // h-96 = 24rem: the stage is the frame's `flex grow` child
  const stage = page.locator(".group\\/preview > .grow").first();
  expect((await stage.boundingBox())?.height).toBe(384);
  await page.goto("/visuals/files/simple");
  await expect(page.locator("h1")).toContainText("Simple");
  expect((await page.locator(".group\\/preview > .grow").first().boundingBox())?.height).toBe(256);
});

test("code toolbar is revealed on hover and on keyboard focus", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  const button = page.locator('button[aria-label="View code"]').first();
  await expect(button).toHaveCSS("opacity", "0");
  await page.locator(".group\\/preview").first().hover();
  await expect(button).toHaveCSS("opacity", "1");
  await page.mouse.move(0, 0);
  await button.focus();
  await expect(button).toHaveCSS("opacity", "1");
});

test("mobile navigation opens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sidebar = page.locator('[data-slot="sidebar-container"]');
  await expect(sidebar).toBeHidden();
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByText("All visuals")).toBeVisible();
});
