/**
 * Generate goldens for NEW blocks (no POC source): renders each variant with
 * the standard preview-frame wrapper via SSR and writes golden/<slug>.html.
 *
 * - Blocks WITH existing goldens (POC-extracted) are never touched.
 * - Run explicitly when authoring a new block:
 *     pnpm vitest run test/generate-goldens.test.ts   (from packages/blocks)
 * - Committed goldens become the regression reference for parity tests.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import type { ComponentType } from "react";

const here = dirname(fileURLToPath(import.meta.url));
const blocksRoot = join(here, "../src");

const reactModules = import.meta.glob<Record<string, unknown>>(
  "../src/*/*/react.tsx",
  { eager: true },
);
const metaModules = import.meta.glob<{ default: {
  category: string; file: string; name: string; description: string; kind: string;
  variants: { label: string; slug: string; size?: string | null; propsRaw: string }[];
} }>("../src/*/*/block.json", { eager: true });
const propsModules = import.meta.glob<{ default: Record<string, Record<string, unknown>> }>(
  "../src/*/*/preview-props.json",
  { eager: true },
);

function parsePropsRaw(raw: string): Record<string, unknown> {
  if (!raw || raw === "{}") return {};
  let s = raw.replace(/`/g, '"').replace(/!0\b/g, "true").replace(/!1\b/g, "false")
    .replace(/([\[,:]\s*)\.(\d)/g, "$10.$2");
  s = s.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3');
  try {
    return JSON.parse(s);
  } catch {
    s = s.replace(/([{,]\s*"[A-Za-z_$][\w$]*"\s*:\s*)([A-Za-z_$][\w$.]*)/g, "$1null");
    const parsed = JSON.parse(s) as Record<string, unknown>;
    for (const k of Object.keys(parsed)) if (parsed[k] === null) delete parsed[k];
    return parsed;
  }
}

const FRAME = 'group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15 ';
const STAGE_BASE = "flex grow items-center gap-2";
const FOOTER = "bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground";
const HEIGHTS: Record<string, string> = {
  xs: "h-48", sm: "h-64", md: "h-96", lg: "h-[28rem]", xl: "h-[32rem]",
};

function frame(content: string, label: string, size?: string | null): string {
  const height = HEIGHTS[size ?? "md"] ?? HEIGHTS.md!;
  return (
    `<div class="${FRAME}"><div class="absolute top-2 right-2 z-20 flex items-center gap-1"></div>` +
    `<div class="${STAGE_BASE} ${height} ">${content}</div>` +
    `<div class="${FOOTER}">${label}</div></div>`
  );
}

describe("generate goldens for new blocks", () => {
  it("renders and writes every missing golden", () => {
    let created = 0;
    for (const [path, meta] of Object.entries(metaModules)) {
      const m = meta.default;
      const dir = join(blocksRoot, m.category.toLowerCase(), m.file);
      const goldenDir = join(dir, "golden");
      const mod = reactModules[path.replace("block.json", "react.tsx")];
      if (!mod) continue;
      // component = PascalCase function export (fall back to last)
      const candidates = Object.entries(mod).filter(
        ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
      );
      if (candidates.length === 0) continue;
      const pascal = m.file.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
      const named = candidates.find(([n]) => n === pascal);
      const Component = (named ?? candidates[candidates.length - 1]!)[1] as unknown as ComponentType<Record<string, unknown>>;

      const propsAll = propsModules[path.replace("block.json", "preview-props.json")]?.default ?? {};
      const needsAny = m.variants.some((v) => !existsSync(join(goldenDir, `${v.slug}.html`)));
      if (!needsAny) continue;
      if (!existsSync(goldenDir)) {
        // only synthesize for blocks that are NOT POC-extracted (no sources dir)
        if (existsSync(join(dir, "sources"))) {
          throw new Error(`POC block ${m.category}/${m.file} missing goldens — extraction bug, refusing to synthesize`);
        }
        mkdirSync(goldenDir, { recursive: true });
      }
      for (const v of m.variants) {
        const goldenPath = join(goldenDir, `${v.slug}.html`);
        if (existsSync(goldenPath)) continue;
        const props = propsAll[v.label] ?? parsePropsRaw(v.propsRaw ?? "");
        const html = renderToStaticMarkup(<Component animated trigger="mount" {...props} />);
        writeFileSync(goldenPath, frame(html, v.label, v.size) + "\n");
        created += 1;
      }
    }
    expect(created).toBeGreaterThanOrEqual(0);
  });
});
