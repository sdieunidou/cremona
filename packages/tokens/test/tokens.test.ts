/** Design tokens integrity: every theme defines the full semantic token set, in its own file. */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { deltaE, parseColor, resolveTheme, tokenBlocks } from "./color";

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

  it("each theme has its own file, and themes.css is all of them in themes.json order", () => {
    const files = readdirSync(join(root, "css", "themes")).sort();
    expect(files).toEqual(THEMES.map((t) => `${t}.css`).sort());
    const rules = (file: string) =>
      readFileSync(join(root, "css", file), "utf8")
        .replace(/^\/\*[\s\S]*?\*\/\s*/, "")
        .trim();
    expect(rules("themes.css"), "run `pnpm build:css`").toBe(
      THEMES.map((t) => rules(join("themes", `${t}.css`))).join("\n\n"),
    );
    const own = tokenBlocks(readFileSync(join(root, "css", "themes", "default.css"), "utf8"));
    expect([...own.keys()]).toEqual([":root", ".dark"]);
    for (const theme of THEMES.slice(1)) {
      const blocks = tokenBlocks(readFileSync(join(root, "css", "themes", `${theme}.css`), "utf8"));
      expect([...blocks.keys()], theme).toEqual([
        `.theme-${theme}:not(.dark)`,
        `.theme-${theme}.dark`,
        `.theme-${theme} .dark`,
      ]);
    }
  });

  it("themes.css and cremona.css define the same token blocks", () => {
    const tokens = tokenBlocks(css);
    // :root and .dark, then per theme: light page, dark page, dark subtree
    expect(tokens.size).toBe(2 + 3 * (THEMES.length - 1));
    expect(tokenBlocks(full)).toEqual(tokens);
  });

  it("a .dark element inside a themed page takes the theme's dark tokens", () => {
    // `.theme-x .dark` outranks `.dark`; `.theme-x:not(.dark)` sits on the page root only, and
    // every light token it sets is redefined in the subtree, so none leaks into it
    const blocks = tokenBlocks(css);
    for (const theme of THEMES) {
      if (theme !== "default")
        expect(blocks.get(`.theme-${theme} .dark`), theme).toEqual(
          blocks.get(`.theme-${theme}.dark`),
        );
      expect(resolveTheme(blocks, theme, "dark-subtree"), theme).toEqual(
        resolveTheme(blocks, theme, "dark"),
      );
    }
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

  it("themes.json swatches are colours of their theme's light tokens", () => {
    const meta: { value: string; swatches: string[] }[] = JSON.parse(
      readFileSync(join(root, "themes.json"), "utf8"),
    );
    const blocks = tokenBlocks(css);
    for (const theme of meta) {
      const light = Object.values(resolveTheme(blocks, theme.value, "light"))
        .filter((v) => /^(oklch\(|#)/.test(v))
        .map(parseColor);
      for (const swatch of theme.swatches) {
        const nearest = Math.min(...light.map((c) => deltaE(parseColor(swatch), c)));
        expect(nearest, `${theme.value} swatch ${swatch}`).toBeLessThan(0.5);
      }
    }
  });

  it("var(--color-*) follows a .dark subtree and a themed element, as the utilities do", () => {
    // the aliases are computed where they are declared: wherever the tokens change
    const preset = readFileSync(join(root, "css", "tailwind.css"), "utf8");
    const inline = preset.slice(preset.indexOf("@theme inline {"));
    const aliases = [
      ...inline.slice(0, inline.indexOf("}")).matchAll(/(--color-[\w-]+): (var\(--[\w-]+\));/g),
    ].map((m) => `${m[1]}:${m[2]}`);
    expect(aliases).toHaveLength(38);
    const selectors = [".dark", ...THEMES.slice(1).map((t) => `.theme-${t}`)].join(",");
    const rule = full.match(
      new RegExp(`(?:^|[{}])${selectors.replace(/\./g, "\\.")}\\{([^}]*)\\}`),
    );
    expect(rule, `${selectors} {--color-*}`).not.toBeNull();
    expect(rule![1]!.split(";")).toEqual(aliases);
    // in that subtree the tokens themselves are the theme's dark ones
    const blocks = tokenBlocks(css);
    expect(resolveTheme(blocks, "zen", "dark-subtree")["--primary"]).toBe(
      resolveTheme(blocks, "zen", "dark")["--primary"],
    );
  });

  it("native controls follow the mode (color-scheme)", () => {
    expect(full).toContain(":root{color-scheme:light}.dark{color-scheme:dark}");
  });

  it("the complete stylesheet embeds the tokens + Inter font", () => {
    expect(full).toContain(":root{--background:");
    expect(full).toContain("Inter Variable");
    expect(full.match(/@font-face\{/g)).toHaveLength(7);
    expect(full).toContain("@layer utilities{");
  });
});
