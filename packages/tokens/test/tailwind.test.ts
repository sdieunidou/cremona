/**
 * css/tailwind.css drives a host's own Tailwind v4 build: imported next to `tailwindcss`, it
 * compiles the blocks' classes to the very rules of cremona.css, with the default theme; the host
 * adds another theme by importing its css/themes/<name>.css.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { tokenBlocks } from "./color";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const preset = readFileSync(join(root, "css", "tailwind.css"), "utf8");
const full = readFileSync(join(root, "css", "cremona.css"), "utf8");

/** Compiles a host stylesheet; it sits in the package so `@cremona/tokens` resolves via `exports`. */
function hostBuild(lines: string[]): string {
  const dir = mkdtempSync(join(root, ".host-"));
  try {
    const entry = join(dir, "app.css");
    writeFileSync(entry, lines.join("\n"));
    return execFileSync(
      join(root, "node_modules", ".bin", "tailwindcss"),
      ["-i", entry, "--minify"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function layer(css: string, name: string): string {
  const start = css.indexOf(`@layer ${name}{`);
  expect(start, `@layer ${name}`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`unclosed @layer ${name}`);
}

describe("css/tailwind.css", () => {
  it("adds to the host's Tailwind instead of bringing its own", () => {
    const code = preset.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(code).not.toMatch(/@import\s+["']tailwindcss/);
    expect(code).not.toMatch(/@source\b/);
    expect(code).not.toMatch(/@import\s+["']tw-animate-css/);
  });

  it("names no import inside the comments of a shipped stylesheet, which AssetMapper would try to download", () => {
    const files = [
      ...readdirSync(join(root, "css")).filter((f) => f.endsWith(".css")),
      ...readdirSync(join(root, "css", "themes")).map((f) => join("themes", f)),
    ];
    expect(files).toContain("tailwind.css");
    for (const file of files) {
      const comments =
        readFileSync(join(root, "css", file), "utf8").match(/\/\*[\s\S]*?\*\//g) ?? [];
      for (const comment of comments) expect(comment, file).not.toMatch(/@import\s+["']/);
    }
  });

  it("maps Cremona's tokens, variants and utilities in a host build", { timeout: 30000 }, () => {
    const css = hostBuild([
      '@import "tailwindcss" source(none);',
      '@import "@cremona/tokens/css/tailwind.css";',
      '@source inline("bg-card text-muted-foreground rounded-3xl font-medium dark:bg-muted ring-1.5 paused data-open:flex no-scrollbar");',
    ]);
    expect(css).toContain(".bg-card{background-color:var(--card)}");
    expect(css).toContain(".text-muted-foreground{color:var(--muted-foreground)}");
    expect(css).toContain(".rounded-3xl{border-radius:calc(var(--radius) * 2.2)}");
    expect(css).toContain("font-weight:510");
    expect(css).toContain(".dark\\:bg-muted:is(.dark *){background-color:var(--muted)}");
    expect(css).toMatch(/\.ring-1\\\.5\{[^}]*calc\(1\.5px \+/);
    expect(css).toContain(".paused{animation-play-state:paused}");
    expect(css).toContain(".data-open\\:flex:where([data-state=open])");
    expect(css).toContain("scrollbar-width:none");
    expect(css).toContain('--font-sans:"Inter Variable", sans-serif');
    expect(css.match(/@font-face\{/g)).toHaveLength(7);
    expect(css).toContain(":root{color-scheme:light}.dark{color-scheme:dark}");
  });

  it("brings the default theme only, in light and dark", { timeout: 30000 }, () => {
    const css = hostBuild([
      '@import "tailwindcss" source(none);',
      '@import "@cremona/tokens/css/tailwind.css";',
      '@source inline("bg-card");',
    ]);
    const blocks = tokenBlocks(css);
    expect([...blocks.keys()]).toEqual([":root", ".dark"]);
    expect(blocks).toEqual(
      tokenBlocks(readFileSync(join(root, "css", "themes", "default.css"), "utf8")),
    );
    expect(css).not.toMatch(/\.theme-[\w-]+(:not\(\.dark\)|\.dark| \.dark)\{/);
  });

  it("adds a theme whose file the host imports", { timeout: 30000 }, () => {
    const css = hostBuild([
      '@import "tailwindcss" source(none);',
      '@import "@cremona/tokens/css/tailwind.css";',
      '@import "@cremona/tokens/css/themes/sakura.css";',
      '@source inline("bg-card");',
    ]);
    const blocks = tokenBlocks(css);
    expect([...blocks.keys()].filter((s) => s.includes(".theme-")).sort()).toEqual([
      ".theme-sakura .dark",
      ".theme-sakura.dark",
      ".theme-sakura:not(.dark)",
    ]);
    const sakura = tokenBlocks(readFileSync(join(root, "css", "themes", "sakura.css"), "utf8"));
    for (const [selector, tokens] of sakura) expect(blocks.get(selector), selector).toEqual(tokens);
    // the --color-* aliases follow the theme's tokens on its element
    expect(css).toMatch(/[,{]\.theme-sakura[,{][^}]*--color-primary:var\(--primary\)/);
  });

  it("compiles the blocks to the rules of cremona.css", { timeout: 30000 }, () => {
    const css = hostBuild([
      '@import "tailwindcss" source(none);',
      // what a shadcn project has: the ui components animate with it
      '@import "tw-animate-css";',
      '@import "@cremona/tokens/css/tailwind.css";',
      '@import "../src/sources.css";',
    ]);
    for (const name of ["theme", "base", "utilities"])
      expect(layer(css, name), `@layer ${name}`).toBe(layer(full, name));
  });
});
