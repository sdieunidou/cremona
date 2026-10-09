/** The counts the docs and the package descriptions state about the whole library are the real ones. */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as store from "../src/store.js";

const root = store.REPO_ROOT;
const index = store.blockIndex();
const actual = {
  blocks: index.length,
  categories: store.catalog().length,
  variants: index.reduce((n, b) => n + b.variants.length, 0),
  themes: store.themes().length,
};

/**
 * What a doc says about the whole library. `min` leaves out the counts of a part of it
 * ("the 10 blocks you would use", "18 blocks get…"): a library-wide count is above it.
 */
const claims = [
  {
    what: "blocks",
    min: 100,
    pattern:
      /\b(\d[\d,]*)\s+(?:animated\s+)?(?:UI\s+|visual\s+)?(?:blocks|visuals|compositions)\b/gi,
  },
  { what: "categories", min: 20, pattern: /\b(\d[\d,]*)\s+categories\b/gi },
  { what: "variants", min: 100, pattern: /\b(\d[\d,]*)\s+(?:ready-made\s+)?variants\b/gi },
  { what: "themes", min: 1, pattern: /\b(\d[\d,]*)\s+themes\b/gi },
];

const docs = [
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "packages/skill/SKILL.md",
  ...readdirSync(join(root, "docs"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `docs/${f}`),
  ...readdirSync(join(root, "packages")).flatMap((p) => [
    `packages/${p}/README.md`,
    `packages/${p}/package.json`,
  ]),
  "package.json",
  "apps/gallery/package.json",
  "apps/gallery/index.html",
].filter((path) => existsSync(join(root, path)));

describe("counts in the docs", () => {
  const found = { blocks: 0, categories: 0, variants: 0, themes: 0 };
  const wrong = [];
  for (const path of docs) {
    const text = readFileSync(join(root, path), "utf8");
    for (const { what, min, pattern } of claims) {
      for (const match of text.matchAll(pattern)) {
        const n = Number(match[1].replaceAll(",", ""));
        if (n < min) continue;
        found[what] += 1;
        if (n !== actual[what])
          wrong.push(`${path}: "${match[0]}" — the library has ${actual[what]} ${what}`);
      }
    }
  }

  it("are exact", () => {
    expect(wrong).toEqual([]);
  });

  it("are stated somewhere, so that the check is not a no-op", () => {
    expect(found.blocks).toBeGreaterThan(3);
    expect(found.categories).toBeGreaterThan(2);
    expect(found.variants).toBeGreaterThan(1);
    expect(found.themes).toBeGreaterThan(3);
  });
});
