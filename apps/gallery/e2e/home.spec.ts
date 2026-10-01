/** Home performance contract: thumbnails mount near the viewport, static until hovered. */
import { test, expect } from "@playwright/test";

const thumbnailStates = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const counts: Record<string, number> = {};
    for (const el of document.querySelectorAll<HTMLElement>("[data-thumbnail]"))
      counts[el.dataset.thumbnail!] = (counts[el.dataset.thumbnail!] ?? 0) + 1;
    return counts;
  });

test("thumbnails mount lazily and render their static final state", async ({ page }) => {
  await page.goto("/");
  await page.locator("h1").waitFor();
  const first = page.locator("[data-thumbnail]").first();
  await expect(first).toHaveAttribute("data-thumbnail", "static");
  await page.waitForTimeout(1000);

  // only the cards near the viewport are mounted
  const top = await thumbnailStates(page);
  expect(top.static).toBeGreaterThan(0);
  expect(top.pending).toBeGreaterThan(100);
  // static previews play no entrance animation
  expect(await first.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);

  // scrolling mounts the rest
  const last = page.locator("[data-thumbnail]").last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveAttribute("data-thumbnail", "static");
});

test("hovering or focusing a card plays its animation, leaving it stops", async ({ page }) => {
  await page.goto("/");
  await page.locator("h1").waitFor();
  const card = page.locator("main li").first();
  const thumb = card.locator("[data-thumbnail]");
  await expect(thumb).toHaveAttribute("data-thumbnail", "static");

  await card.hover();
  await expect(thumb).toHaveAttribute("data-thumbnail", "playing");
  await expect
    .poll(() => thumb.evaluate((el) => el.getAnimations({ subtree: true }).length))
    .toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await expect(thumb).toHaveAttribute("data-thumbnail", "static");

  await card.getByRole("link").focus();
  await expect(thumb).toHaveAttribute("data-thumbnail", "playing");
  await card.getByRole("link").blur();
  await expect(thumb).toHaveAttribute("data-thumbnail", "static");
});
