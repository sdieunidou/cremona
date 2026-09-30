/** Every class a block renders has a rule in cremona.css (compiled from them by `pnpm build:css`). */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "css", "cremona.css"), "utf8");
const blocks = join(root, "../blocks/src");

// selectors used by animation code, and a class kept by a POC golden that Tailwind v4 does not define
const NO_RULE = new Set([
  "file-card",
  "arrow-badge",
  "spinner-badge",
  "check-badge",
  "file-content",
  "progress-fill",
  "key-glow-0",
  "key-glow-1",
  "key-glow-2",
  "key-ripple-0",
  "key-ripple-1",
  "key-ripple-2",
  "ring-1.5",
]);
const MARKER = /^(group|peer)(\/.+)?$|^lucide(-.+)?$|^dark$/;

function definedClasses(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/g)) {
    out.add(
      m[1]!
        .replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, hex: string) =>
          String.fromCodePoint(parseInt(hex, 16)),
        )
        .replace(/\\(.)/g, "$1"),
    );
  }
  return out;
}

function goldenClasses(): Map<string, string> {
  const used = new Map<string, string>();
  for (const category of readdirSync(blocks, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const block of readdirSync(join(blocks, category.name), { withFileTypes: true })) {
      const dir = join(blocks, category.name, block.name, "golden");
      let files: string[] = [];
      try {
        files = readdirSync(dir).filter((f) => f.endsWith(".html"));
      } catch {
        continue;
      }
      for (const file of files) {
        const html = readFileSync(join(dir, file), "utf8");
        for (const m of html.matchAll(/\sclass="([^"]*)"/g)) {
          const value = m[1]!.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
          for (const cls of value.split(/\s+/))
            if (cls) used.set(cls, `${category.name}/${block.name}`);
        }
      }
    }
  }
  return used;
}

describe("cremona.css coverage", () => {
  it("defines every class the goldens render", () => {
    const defined = definedClasses(css);
    const missing = [...goldenClasses()]
      .filter(([cls]) => !defined.has(cls) && !NO_RULE.has(cls) && !MARKER.test(cls))
      .map(([cls, block]) => `${cls} (${block})`);
    expect(missing, "run `pnpm build:css`").toEqual([]);
  });
});
