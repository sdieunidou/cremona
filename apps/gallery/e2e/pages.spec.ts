/** Smoke test: every block page renders every variant frame without an uncaught error. */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const blocksDir = new URL("../../../packages/blocks/", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("catalog.json", blocksDir), "utf8")) as {
  slug: string;
  items: { file: string }[];
}[];

// Pages known to crash today. `test.fail` inverts them: fixing one makes CI fail
// until it is removed from this list, so the list can only shrink.
const KNOWN_BROKEN = new Set<string>([
  // preview-props.json holds JSON-serialized React elements (React error #31)
  "ai/tools",
  "api/logs",
  "branding/spotlight",
  "connections/converge",
  "connections/flow",
  "connections/pipeline",
  "connections/sync",
  "integrations/hub",
  "integrations/logo-orbit",
  "integrations/logo-reel",
  "media/audio-waveform",
  "search/command-palette",
  "search/results",
]);

for (const group of catalog) {
  for (const { file } of group.items) {
    const key = `${group.slug}/${file}`;
    const meta = JSON.parse(readFileSync(new URL(`src/${key}/block.json`, blocksDir), "utf8")) as {
      name: string;
      variants: unknown[];
    };
    test(`renders ${key}`, async ({ page }) => {
      test.fail(KNOWN_BROKEN.has(key), "known crash — see KNOWN_BROKEN");
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/visuals/${key}`);
      await expect(page.locator("h1")).toContainText(meta.name, { timeout: 8000 });
      await expect(page.locator(".group\\/preview")).toHaveCount(meta.variants.length);
      expect(errors, `uncaught errors on /visuals/${key}`).toEqual([]);
    });
  }
}
