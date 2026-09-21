/** Manifest coherence: every block has stimulus templates + animatable markup. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "templates", "manifest.json"), "utf8"));

const blocksDir = join(root, "../../packages/blocks/src");
describe("stimulus manifest", () => {
  it("covers every block with a golden", () => {
    let goldenBlocks = 0;
    for (const category of readdirSync(blocksDir, { withFileTypes: true })) {
      if (!category.isDirectory()) continue;
      const catDir = join(blocksDir, category.name);
      for (const block of readdirSync(catDir, { withFileTypes: true })) {
        if (!block.isDirectory()) continue;
        if (!existsSync(join(catDir, block.name, "block.json"))) continue;
        goldenBlocks += 1;
        expect(
          manifest[`${category.name}/${block.name}`],
          `${category.name}/${block.name} missing from manifest`,
        ).toBeTruthy();
      }
    }
    expect(Object.keys(manifest).length).toBe(goldenBlocks);
  });

  it("templates carry controller + anim data on the stat-card default", () => {
    const html = readFileSync(
      join(root, "templates/metrics/stat-card/000-default.html"),
      "utf8",
    );
    expect(html).toContain('data-controller="cremona-visual"');
    expect(html).toContain('data-anim-order="0"');
    expect(html).toContain("data-anim-to=");
  });

  it("manifest entries expose variants", () => {
    const entry = manifest["metrics/stat-card"];
    expect(entry.variants.length).toBeGreaterThan(0);
    expect(entry.variants[0].label).toBe("default");
  });
});
