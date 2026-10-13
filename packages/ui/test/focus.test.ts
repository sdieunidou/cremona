/**
 * Keyboard focus is drawn with one recipe, `focus-visible:outline-2 focus-visible:outline-offset-2
 * focus-visible:outline-ring` (docs/accessibility.md). In Tailwind v4, `outline-none` sets
 * `--tw-outline-style: none`, and `focus-visible:outline-2` draws `outline-style:
 * var(--tw-outline-style)`: on the same element, the ring is never shown. A container that only
 * receives focus programmatically (a dialog's content) may keep `outline-none`, with no ring.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const sources = readdirSync(src)
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => ({ file, code: readFileSync(join(src, file), "utf8") }));

/** every string literal, and the arguments of every `cn(…)` and `cva(…)` call taken together */
function classGroups(code: string): string[] {
  const groups = [...code.matchAll(/"([^"\n]*)"/g)].map((match) => match[1] ?? "");
  for (const call of code.matchAll(/\b(?:cn|cva)\(/g)) {
    let depth = 1;
    let quote: string | null = null;
    let index = (call.index ?? 0) + call[0].length;
    const start = index;
    for (; index < code.length && depth > 0; index++) {
      const char = code[index];
      if (quote) {
        if (char === quote && code[index - 1] !== "\\") quote = null;
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
      }
    }
    groups.push(
      [...code.slice(start, index).matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)]
        .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
        .join(" "),
    );
  }
  return groups;
}

describe("keyboard focus stays visible", () => {
  it("scans every component", () => {
    expect(sources.length).toBeGreaterThanOrEqual(8);
  });

  it("never puts outline-none next to the focus-visible outline", () => {
    const found = sources.flatMap(({ file, code }) =>
      classGroups(code)
        .map((group) => group.split(/\s+/))
        .filter(
          (classes) =>
            classes.includes("outline-none") &&
            classes.some((name) => /(?:^|:)focus-visible:-?outline-/.test(name)),
        )
        .map((classes) => `${file}: ${classes.filter((name) => /outline/.test(name)).join(" ")}`),
    );
    expect(found).toEqual([]);
  });
});
