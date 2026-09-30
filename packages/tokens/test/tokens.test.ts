/** Design tokens integrity: every theme defines the full semantic token set. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "css", "themes.css"), "utf8");
const full = readFileSync(join(root, "css", "cremona.css"), "utf8");

const SEMANTIC = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--radius",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
];

const STATUS = [
  "--success",
  "--success-foreground",
  "--warning",
  "--warning-foreground",
  "--info",
  "--info-foreground",
  "--destructive-foreground",
];

const THEMES = [
  "default",
  "claude-plus",
  "light-green",
  "zen",
  "sakura",
  "tiesen",
  "deep-purple",
  "indigo-clean",
  "brutalism",
];

function blockFor(selectorPrefix: string): string {
  const blocks = css.split("\n\n");
  const found = blocks.filter((b) => b.startsWith(selectorPrefix));
  expect(found.length, `selector ${selectorPrefix} present exactly once`).toBe(1);
  return found[0]!;
}

describe("cremona tokens", () => {
  it("default light + dark exist", () => {
    blockFor(":root{--background");
    blockFor(".dark{--background");
  });

  it("default light + dark define the status tokens every theme inherits", () => {
    for (const sel of [":root{--background", ".dark{--background"]) {
      const block = blockFor(sel);
      for (const token of STATUS) expect(block, `${sel} ${token}`).toContain(`${token}:`);
    }
  });

  it("default dark is the neutral palette", () => {
    expect(blockFor(".dark{--background")).toContain("--background:oklch(14.5% 0 0)");
  });

  it("themes.css and cremona.css define the same token blocks", () => {
    // `.dark{` must be the bare rule, not the tail of `.theme-<name>.dark{`
    const tokenBlocks = (source: string) =>
      new Map(
        [
          ...source.matchAll(
            /(?<![\w.-])(:root|\.dark|\.theme-[\w-]+(?::not\(\.dark\)|\.dark))\{(--background:[^}]*)\}/g,
          ),
        ].map((m) => [m[1], m[2]]),
      );
    const tokens = tokenBlocks(css);
    expect(tokens.size).toBe(18);
    expect(tokenBlocks(full)).toEqual(tokens);
  });

  for (const theme of THEMES.slice(1)) {
    it(`theme ${theme} defines light + dark with all semantic tokens`, () => {
      for (const sel of [
        `.theme-${theme}:not(.dark){--background`,
        `.theme-${theme}.dark{--background`,
      ]) {
        const block = blockFor(sel);
        for (const token of SEMANTIC) {
          expect(block, `${sel} missing ${token}`).toContain(token);
        }
      }
    });
  }

  it("theme classes match themes.json", () => {
    const meta = JSON.parse(readFileSync(join(root, "themes.json"), "utf8"));
    expect(meta.map((t) => t.value)).toEqual(THEMES);
  });

  it("the complete stylesheet embeds the tokens + Inter font", () => {
    expect(full).toContain(":root{--background:");
    expect(full).toContain("Inter Variable");
    expect(full.match(/@font-face\{/g)).toHaveLength(7);
    expect(full).toContain("@layer utilities{");
  });
});
