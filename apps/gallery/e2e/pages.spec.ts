/**
 * Smoke test: every block page renders every variant frame, none of them as an error card,
 * without an uncaught error or a console error (a failed image or font request logs one).
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const blocksDir = new URL("../../../packages/blocks/", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("catalog.json", blocksDir), "utf8")) as {
  slug: string;
  items: { file: string }[];
}[];

for (const group of catalog) {
  for (const { file } of group.items) {
    const key = `${group.slug}/${file}`;
    const meta = JSON.parse(readFileSync(new URL(`src/${key}/block.json`, blocksDir), "utf8")) as {
      name: string;
      variants: unknown[];
    };
    test(`renders ${key}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`${message.text()} ${message.location().url}`);
      });
      await page.goto(`/visuals/${key}`);
      await expect(page.locator("h1")).toContainText(meta.name, { timeout: 8000 });
      await expect(page.locator(".group\\/preview")).toHaveCount(meta.variants.length);
      await expect(page.locator("[data-preview-error]")).toHaveCount(0);
      await page.waitForLoadState("networkidle");
      expect(errors, `errors on /visuals/${key}`).toEqual([]);
    });
  }
}
