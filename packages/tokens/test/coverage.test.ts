/**
 * Every class a block renders has a rule in cremona.css (compiled from them by `pnpm build:css`):
 * the goldens hold the initial render, the Stimulus templates the final one (`animated={false}`).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "css", "cremona.css"), "utf8");
const blocks = join(root, "../blocks/src");
const templates = join(root, "../stimulus/templates");

// selectors used by animation code
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

/** class → the block that renders it, over `<category>/<block>/<sub>/*.html` files */
function renderedClasses(base: string, sub: string): Map<string, string> {
  const used = new Map<string, string>();
  for (const category of readdirSync(base, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const block of readdirSync(join(base, category.name), { withFileTypes: true })) {
      const dir = join(base, category.name, block.name, sub);
      let files: string[] = [];
      try {
        files = readdirSync(dir).filter((f) => f.endsWith(".html"));
      } catch {
        continue;
      }
      for (const file of files) {
        const html = readFileSync(join(dir, file), "utf8");
        for (const m of html.matchAll(/\sclass="([^"]*)"/g)) {
          const value = m[1]!
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;|&#39;/g, "'")
            .replace(/&amp;/g, "&");
          for (const cls of value.split(/\s+/))
            if (cls) used.set(cls, `${category.name}/${block.name}`);
        }
      }
    }
  }
  return used;
}

function missingRules(used: Map<string, string>): string[] {
  const defined = definedClasses(css);
  return [...used]
    .filter(([cls]) => !defined.has(cls) && !NO_RULE.has(cls) && !MARKER.test(cls))
    .map(([cls, block]) => `${cls} (${block})`);
}

describe("cremona.css coverage", () => {
  it("defines every class the goldens render", () => {
    expect(missingRules(renderedClasses(blocks, "golden")), "run `pnpm build:css`").toEqual([]);
  });

  it("defines every class the Stimulus templates render", () => {
    const used = renderedClasses(templates, "");
    expect(used.size).toBeGreaterThan(1000);
    expect(missingRules(used), "run `pnpm build:css`").toEqual([]);
  });
});
