/**
 * Generates the missing goldens: renders each variant that has none, with the
 * props of its preview-props.json and the standard preview-frame wrapper, and
 * writes golden/<slug>.html.
 *
 * - A golden that exists is never touched: it is the regression reference of the
 *   block's parity test. To change one on purpose, delete it, run this test,
 *   review the diff and run the parity test.
 * - Run it explicitly when authoring a block or a variant (from packages/blocks):
 *     pnpm vitest run test/generate-goldens.test.tsx
 */
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import type { ComponentType } from "react";
import { stripResourceHints } from "./helpers/parity.js";
import { hydrateProps, type Props } from "./helpers/preview-props.js";

const here = dirname(fileURLToPath(import.meta.url));

const reactModules = import.meta.glob<Record<string, unknown>>("../src/*/*/react.tsx", {
  eager: true,
});
const metaModules = import.meta.glob<{
  default: {
    file: string;
    variants: { label: string; slug: string; size?: string | null }[];
  };
}>("../src/*/*/block.json", { eager: true });
const propsModules = import.meta.glob<{ default: Record<string, Props> }>(
  "../src/*/*/preview-props.json",
  { eager: true },
);

const FRAME =
  "group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15 ";
const STAGE_BASE = "flex grow items-center gap-2";
const FOOTER = "bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground";
const HEIGHTS: Record<string, string> = {
  xs: "h-48",
  sm: "h-64",
  md: "h-96",
  lg: "h-[28rem]",
  xl: "h-[32rem]",
};

function frame(content: string, label: string, size?: string | null): string {
  const height = HEIGHTS[size ?? "md"] ?? HEIGHTS.md!;
  return (
    `<div class="${FRAME}"><div class="absolute top-2 right-2 z-20 flex items-center gap-1"></div>` +
    `<div class="${STAGE_BASE} ${height} ">${content}</div>` +
    `<div class="${FOOTER}">${label}</div></div>`
  );
}

describe("generate the missing goldens", () => {
  it("renders and writes every missing golden", () => {
    let created = 0;
    for (const [path, meta] of Object.entries(metaModules)) {
      const m = meta.default;
      const dir = join(here, dirname(path));
      const goldenDir = join(dir, "golden");
      const mod = reactModules[path.replace("block.json", "react.tsx")];
      if (!mod) continue;
      if (m.variants.every((v) => existsSync(join(goldenDir, `${v.slug}.html`)))) continue;

      // component = the PascalCase function export named after the file (else the last one)
      const candidates = Object.entries(mod).filter(
        ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
      );
      if (candidates.length === 0) continue;
      const pascal = m.file
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("");
      const named = candidates.find(([n]) => n === pascal);
      const Component = (named ??
        candidates[candidates.length - 1]!)[1] as unknown as ComponentType<Props>;

      const previews = propsModules[path.replace("block.json", "preview-props.json")]?.default;
      mkdirSync(goldenDir, { recursive: true });
      for (const v of m.variants) {
        const goldenPath = join(goldenDir, `${v.slug}.html`);
        if (existsSync(goldenPath)) continue;
        const props = previews?.[v.label];
        if (!props)
          throw new Error(`${path}: no props for "${v.label}" in preview-props.json, no golden`);
        const html = stripResourceHints(
          renderToStaticMarkup(
            <Component animated trigger="inViewRepeat" {...(hydrateProps(props) as Props)} />,
          ),
        );
        writeFileSync(goldenPath, frame(html, v.label, v.size) + "\n");
        created += 1;
      }
    }
    expect(created).toBeGreaterThanOrEqual(0);
  });
});
