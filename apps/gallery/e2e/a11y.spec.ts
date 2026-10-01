/**
 * axe on the gallery chrome, light and dark. The block previews are excluded: their roots are
 * aria-hidden illustrations, covered by the blocks' own tests.
 */
import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

async function violations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .exclude("[data-thumbnail]")
    .exclude(".group\\/preview > .grow")
    .analyze();
  return violations.map(
    (v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ") ?? ""}`,
  );
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test("home, search dialog and theme menu", async ({ page }) => {
      await page.goto("/");
      await page.locator("h1").waitFor();
      expect(await violations(page), "home").toEqual([]);

      await page.getByRole("button", { name: "Search visuals" }).click();
      await page.getByRole("combobox", { name: "Search visuals" }).fill("chart");
      await expect(page.getByRole("listbox").getByRole("option").first()).toBeVisible();
      expect(await violations(page), "search dialog").toEqual([]);
      await page.keyboard.press("Escape");

      await page.getByRole("button", { name: "Theme and appearance" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      expect(await violations(page), "theme menu").toEqual([]);
    });

    test("block page and code panel", async ({ page }) => {
      await page.goto("/visuals/metrics/stat-card");
      await expect(page.locator("h1")).toHaveText("Stat Card");
      expect(await violations(page), "block page").toEqual([]);

      await page.getByRole("button", { name: "View code" }).first().click();
      await expect(page.getByRole("tablist").first()).toBeVisible();
      expect(await violations(page), "code panel").toEqual([]);
    });

    test("not-found page and mobile navigation", async ({ page }) => {
      await page.goto("/visuals/charts/pie");
      await page.locator("h1").waitFor();
      expect(await violations(page), "404").toEqual([]);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await page.getByRole("button", { name: "Navigation menu" }).click();
      await expect(page.locator('[data-slot="sidebar-container"]')).toBeVisible();
      expect(await violations(page), "mobile navigation").toEqual([]);
    });
  });
}
