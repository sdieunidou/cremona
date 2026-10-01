/**
 * css/tailwind.css drives a host's own Tailwind v4 build: imported next to `tailwindcss`, it
 * compiles Cremona's theme mapping, variants and utilities.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const preset = readFileSync(join(root, "css", "tailwind.css"), "utf8");

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

describe("css/tailwind.css", () => {
  it("adds to the host's Tailwind instead of bringing its own", () => {
    const code = preset.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(code).not.toMatch(/@import\s+["']tailwindcss/);
    expect(code).not.toMatch(/@source\b/);
    expect(code).not.toMatch(/@import\s+["']tw-animate-css/);
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
    expect(css).toContain(":root{--background:");
    expect(css).toContain(".theme-sakura:not(.dark){");
    expect(css.match(/@font-face\{/g)).toHaveLength(7);
    expect(css).toContain(":root{color-scheme:light}.dark{color-scheme:dark}");
  });
});
