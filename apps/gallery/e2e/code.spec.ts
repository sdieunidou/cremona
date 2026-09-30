import { test, expect } from "@playwright/test";

test("code panel: open, switch tabs, copy React usage", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await page.locator("h1").waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);

  // hover the first preview frame to reveal the toolbar, then open the code panel
  const first = page.locator(".group\\/preview").first();
  await first.hover();
  await page.getByRole("button", { name: "View code" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Code for default" });
  await expect(dialog).toBeVisible();

  // Usage tab: import from the public path + JSX with the animated prop
  const code = dialog.locator("code");
  await expect(code).toContainText('import { StatCard } from "@cremona/blocks/metrics/stat-card";');
  await expect(code).toContainText("<StatCard");
  await expect(code).toContainText("animated");

  // Stimulus tab loads the template
  await dialog.getByRole("tab", { name: "Stimulus" }).click();
  await expect(dialog.getByRole("tab", { name: "Stimulus" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(dialog.locator("code")).toContainText('data-controller="cremona-visual"');

  // Copy the Usage snippet (switch back first, grant clipboard permissions)
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await dialog.getByRole("tab", { name: "Usage" }).click();
  await dialog.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Copied" })).toBeVisible();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain('from "@cremona/blocks/metrics/stat-card"');
  await page.screenshot({ path: test.info().outputPath("code-panel.png") });

  // Escape closes
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("code panel: keyboard tabs and focus management", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await page.locator("h1").waitFor({ timeout: 20000 });
  const viewCode = page.getByRole("button", { name: "View code" }).first();
  await viewCode.focus();
  await page.keyboard.press("Enter");

  // focus moves into the panel, on the selected tab
  const usage = page.getByRole("tab", { name: "Usage" });
  await expect(usage).toBeFocused();
  await expect(page.getByRole("tablist")).toHaveCount(1);

  // arrows move and select, Home/End jump
  await page.keyboard.press("ArrowRight");
  const source = page.getByRole("tab", { name: "React source" });
  await expect(source).toBeFocused();
  await expect(source).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("export function StatCard");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Stimulus" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(usage).toBeFocused();

  // the panel's controls follow the tabs; the covered toolbar is out of the tab order
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Copy", exact: true })).toBeFocused();
  await usage.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(viewCode).not.toBeFocused();
  await expect(page.getByRole("button", { name: "Copy React usage" }).first()).not.toBeFocused();
  await usage.focus();

  // Escape closes and returns focus to "View code"
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(viewCode).toBeFocused();
});

test("source tab shows the react implementation", async ({ page }) => {
  await page.goto("/visuals/components/button");
  await page.locator("h1").waitFor({ timeout: 20000 });
  await page.waitForTimeout(600);
  const first = page.locator(".group\\/preview").first();
  await first.hover();
  await page.getByRole("button", { name: "View code" }).first().click();
  await page.getByRole("tab", { name: "React source" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("export function Button");
});
