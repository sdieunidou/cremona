import { test, expect } from "@playwright/test";

test("code panel: open, switch tabs, copy React usage", async ({ page }) => {
  await page.goto("/visuals/metrics/stat-card");
  await page.locator("h1").waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);

  // hover the first preview frame to reveal the toolbar, then open the code panel
  const first = page.locator(".group\\/preview").first();
  await first.hover();
  await page.locator('button[aria-label="View code"]').first().click();
  const dialog = page.locator('div[role="dialog"][aria-label="Snippet usage"]');
  await expect(dialog).toBeVisible();

  // Usage tab: import + JSX with the animated prop
  const code = dialog.locator("code");
  await expect(code).toContainText('@cremona/blocks/src/metrics/stat-card/react.js');
  await expect(code).toContainText("<StatCard");
  await expect(code).toContainText("animated");

  // Stimulus tab loads the template
  await dialog.getByRole("button", { name: "Stimulus" }).click();
  await expect(dialog.locator("code")).toContainText('data-controller="cremona-visual"');

  // Copy the Usage snippet (switch back first, grant clipboard permissions)
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await dialog.getByRole("button", { name: "Usage" }).click();
  await dialog.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Copied" })).toBeVisible();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain("@cremona/blocks/src/metrics/stat-card/react.js");
  await page.screenshot({ path: "/tmp/opencode/code-panel.png" });

  // Escape closes
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("source tab shows the react implementation", async ({ page }) => {
  await page.goto("/visuals/components/button");
  await page.locator("h1").waitFor({ timeout: 20000 });
  await page.waitForTimeout(600);
  const first = page.locator(".group\\/preview").first();
  await first.hover();
  await page.locator('button[aria-label="View code"]').first().click();
  await page.getByRole("button", { name: "React source" }).click();
  await expect(page.locator('div[role="dialog"] code')).toContainText("export function Button");
});
