import { describe, it, expect, beforeAll } from "vitest";
import { createElement, isValidElement } from "react";
import * as lucide from "lucide-react";
import { transformWithEsbuild } from "vite";
import { blockKeys, loadBlock, type BlockEntry } from "../src/lib/discovery.js";
import { reactUsage } from "../src/lib/code.js";
import { hydrateProps } from "../src/lib/icons.js";

/** Compile a usage snippet and return the props its JSX passes to the block. */
async function evaluate(snippet: string, component: unknown) {
  const [imports = "", ...rest] = snippet.split("\n\n");
  const name = /^import \{ (\w+) \} from "@cremona\/blocks\/[a-z0-9-]+\/[a-z0-9-]+";$/m.exec(
    imports,
  )?.[1];
  const icons =
    /^import \{ ([^}]+) \} from "lucide-react";$/m.exec(imports)?.[1]?.split(", ") ?? [];
  const { code } = await transformWithEsbuild(`const __el = (${rest.join("\n\n")});`, "u.jsx", {
    loader: "jsx",
    jsx: "transform",
    jsxFactory: "__h",
  });
  const icon = (n: string) => (lucide as Record<string, unknown>)[n];
  const el = new Function("__h", name ?? "_", ...icons, `${code}\nreturn __el;`)(
    createElement,
    component,
    ...icons.map(icon),
  ) as { type: unknown; props: Record<string, unknown> };
  return { name, icons, el };
}

function same(a: unknown, b: unknown): boolean {
  if (isValidElement(a) || isValidElement(b)) {
    return isValidElement(a) && isValidElement(b) && a.type === b.type && same(a.props, b.props);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((x, i) => same(x, b[i]))
    );
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return (
      same(ka, kb) &&
      ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    );
  }
  return Object.is(a, b);
}

let blocks: Record<string, BlockEntry>;
beforeAll(async () => {
  const entries = await Promise.all(blockKeys.map(loadBlock));
  blocks = Object.fromEntries(entries.map((e) => [e.key, e]));
});

describe("Copy React usage snippets", () => {
  it("covers every block", () => {
    expect(Object.keys(blocks)).toHaveLength(160);
  });

  it("reproduce the exact props the gallery renders, for every variant", async () => {
    const wrong: string[] = [];
    for (const entry of Object.values(blocks)) {
      for (const { label } of entry.meta.variants) {
        const snippet = reactUsage(entry, label);
        const { name, icons, el } = await evaluate(snippet, entry.Component);
        const { animated, ...props } = el.props;
        const missingIcon = icons.find((i) => !(i in lucide));
        const expected = hydrateProps(entry.previewProps[label] ?? {});
        if (name !== entry.exportName || missingIcon || animated !== true || !same(props, expected))
          wrong.push(`${entry.key} · ${label}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("keeps false props and imports nested icons", () => {
    const pick = (key: string) => blocks[key]!;
    expect(reactUsage(pick("metrics/stat-card"), "default · no gradient")).toContain(
      "gradient={false}",
    );
    expect(reactUsage(pick("avatars/grid"), "default")).toContain(
      'import { AvatarGrid } from "@cremona/blocks/avatars/grid";',
    );
    const flow = reactUsage(pick("connections/flow"), "custom icons");
    expect(flow).toContain('<Smartphone className={"size-4"} strokeWidth={2} />');
    expect(flow).toMatch(/^import \{ .*Smartphone.* \} from "lucide-react";$/m);
  });
});
