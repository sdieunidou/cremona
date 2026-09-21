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
  await page.screenshot({ path: "/tmp/opencode/home.png", fullPage: false });
});

test("block page renders all variant frames", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await page.waitForTimeout(1500);
  await expect(page.locator("h1")).toContainText("Stat Card");
  const frames = page.locator(".group\\/preview");
  expect(await frames.count()).toBe(10);
  await page.screenshot({ path: "/tmp/opencode/stat-card.png" });
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
  await page.screenshot({ path: "/tmp/opencode/dark-claude.png" });
});

test("search palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  await page.locator('button[aria-label="Toggle theme"]').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Search visuals...").fill("kanban");
  await page.screenshot({ path: "/tmp/opencode/search.png" });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  await expect(page.locator("h1")).toContainText("Kanban");
});
