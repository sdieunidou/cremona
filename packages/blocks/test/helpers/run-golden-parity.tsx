/**
 * Generic golden parity runner shared by every block test.
 *
 * Renders the block for each variant of its block.json, with the props of its
 * preview-props.json, in its initial "hidden" state, and compares the DOM
 * structure against the variant's golden.
 */
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { compare, findDivEnd, goldenVisual, parseHtmlFragment } from "./parity.js";
import { hydrateProps, readPreviewProps } from "./preview-props.js";

/** The visual root inside a golden: the preview frame's stage holds it. */
const ROOT = '<div aria-hidden="true" class="relative isolate flex size-full';

export interface RunParityOptions {
  blockDir: string; // absolute path to packages/blocks/src/<cat>/<block>
  Component: ComponentType<Record<string, unknown>>;
  /** max diffs printed */
  maxDiffs?: number;
}

export function runGoldenParity(
  name: string,
  { blockDir, Component, maxDiffs = 10 }: RunParityOptions,
): void {
  const goldenDir = join(blockDir, "golden");
  const meta = JSON.parse(readFileSync(join(blockDir, "block.json"), "utf8")) as {
    variants: { label: string; slug: string }[];
  };
  const previews = readPreviewProps(blockDir);

  describe(`golden parity: ${name}`, () => {
    it("has variants", () => {
      expect(meta.variants.length).toBeGreaterThan(0);
    });

    for (const variant of meta.variants) {
      it(`matches golden: ${variant.label}`, () => {
        const goldenPath = join(goldenDir, `${variant.slug}.html`);
        if (!existsSync(goldenPath))
          throw new Error(
            `no golden for "${variant.label}": run test/generate-goldens.test.tsx (${variant.slug}.html)`,
          );
        const props = previews[variant.label];
        if (!props) throw new Error(`no props for "${variant.label}" in preview-props.json`);

        const html = readFileSync(goldenPath, "utf8");
        const rootStart = html.indexOf(ROOT);
        const goldenInner =
          rootStart === -1
            ? goldenVisual(html)
            : html.slice(rootStart, findDivEnd(html, rootStart));
        const ours = renderToStaticMarkup(
          <Component
            animated
            trigger="inViewRepeat"
            {...(hydrateProps(props) as Record<string, unknown>)}
          />,
        );
        const diffs = compare(parseHtmlFragment(goldenInner), parseHtmlFragment(ours));
        if (diffs.length) {
          const shown = diffs
            .slice(0, maxDiffs)
            .map((d) => `  ${d.path}: ${d.message}`)
            .join("\n");
          throw new Error(`parity diff (${diffs.length}) for "${variant.label}":\n${shown}`);
        }
        expect(diffs).toHaveLength(0);
      });
    }

    it("has props only for its variants", () => {
      const labels = new Set(meta.variants.map((v) => v.label));
      expect(Object.keys(previews).filter((label) => !labels.has(label))).toEqual([]);
    });
  });
}
