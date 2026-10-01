/** Visual smoke test: screenshots + layout assertions (sidebar vs content). */
import { test, expect } from "@playwright/test";

test("home: sidebar sits beside content, not above", async ({ page }) => {
  await page.goto("/");
  await page.locator("header").first().waitFor({ timeout: 20000 });
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
  await expect(page.locator("h1")).toContainText("Stat Card");
  await expect(page.locator(".group\\/preview")).toHaveCount(10);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: test.info().outputPath("stat-card.png") });
});

test("dark mode + theme switch apply classes", async ({ page }) => {
  await page.goto("/");
  const dark = page.getByRole("button", { name: "Dark mode" });
  await expect(dark).toHaveAttribute("aria-pressed", "false");
  await dark.click();
  await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  await expect(dark).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Theme and appearance" }).click();
  await page.getByRole("menuitemradio", { name: /Claude\+/ }).click();
  await expect(page.locator("html")).toHaveClass(/theme-claude-plus/);
  await page.screenshot({ path: test.info().outputPath("dark-claude.png") });

  // "System" follows the OS preference again
  await page.emulateMedia({ colorScheme: "light" });
  await page.getByRole("button", { name: "Theme and appearance" }).click();
  await page.getByRole("menuitemradio", { name: "System" }).click();
  await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
});

test("search palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Dark mode" }).waitFor({ timeout: 20000 });
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search visuals" }).fill("kanban");
  await page.screenshot({ path: test.info().outputPath("search.png") });
  await page.keyboard.press("Enter");
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
  const button = page.getByRole("button", { name: "View code" }).first();
  await expect(button).toHaveCSS("opacity", "0");
  await page.locator(".group\\/preview").first().hover();
  await expect(button).toHaveCSS("opacity", "1");
  await page.mouse.move(0, 0);
  await button.focus();
  await expect(button).toHaveCSS("opacity", "1");
});

test("sidebar icons are 16px", async ({ page }) => {
  await page.goto("/");
  const icon = page.getByRole("link", { name: "All visuals" }).locator("svg");
  const box = await icon.boundingBox();
  expect(box?.width).toBe(16);
  expect(box?.height).toBe(16);
});
