/** Filesystem discovery of all blocks (single source of truth: packages/blocks/src). */
import type { ComponentType } from "react";

export interface BlockJsonMeta {
  category: string;
  file: string;
  name: string;
  description: string;
  added: string;
  kind: string;
  sourcePath: string;
  page: { cols: number; animated: boolean; trigger: string };
  variants: { label: string; slug: string; size?: string | null; propsRaw: string }[];
}

export interface CatalogItem {
  file: string;
  name: string;
  description: string;
  added: string;
  kind?: string;
  categorySlug: string;
}

export interface CatalogGroup {
  category: string;
  slug: string;
  items: CatalogItem[];
}

// eager imports (dev-friendly, ~345 small modules)
const reactModules = import.meta.glob<{ [k: string]: ComponentType<Record<string, unknown>> }>(
  "../../../../packages/blocks/src/*/*/react.tsx",
  { eager: true },
);
const metaModules = import.meta.glob<{ default: BlockJsonMeta }>(
  "../../../../packages/blocks/src/*/*/block.json",
  { eager: true },
);
const propsModules = import.meta.glob<{ default: Record<string, Record<string, unknown>> }>(
  "../../../../packages/blocks/src/*/*/preview-props.json",
  { eager: true },
);
const catalogModule = import.meta.glob<{ default: CatalogGroup[] }>(
  "../../../../packages/blocks/catalog.json",
  { eager: true },
);
const thumbsModule = import.meta.glob<{ default: Record<string, Record<string, unknown>> }>(
  "../../../../packages/blocks/thumbnail-defaults.json",
  { eager: true },
);

function keyOf(path: string): string {
  // .../packages/blocks/src/<category>/<file>/<name>.ext -> "<category>/<file>"
  const parts = path.split("/");
  const file = parts[parts.length - 2];
  const category = parts[parts.length - 3];
  return `${category}/${file}`;
}

export const catalog: CatalogGroup[] = Object.values(catalogModule)[0]?.default ?? [];

export const thumbnails: Record<string, Record<string, unknown>> =
  Object.values(thumbsModule)[0]?.default ?? {};

export interface BlockEntry {
  key: string;
  meta: BlockJsonMeta;
  Component: ComponentType<Record<string, unknown>>;
  previewProps: Record<string, Record<string, unknown>>;
}

export const blocks: Record<string, BlockEntry> = {};
for (const [path, mod] of Object.entries(metaModules)) {
  const key = keyOf(path);
  const componentMod = reactModules[path.replace("block.json", "react.tsx")];
  if (!componentMod) continue;
  const Component = pickComponent(componentMod, key);
  if (!Component) continue;
  const propsMod = propsModules[path.replace("block.json", "preview-props.json")];
  blocks[key] = {
    key,
    meta: mod.default,
    Component,
    previewProps: propsMod?.default ?? {},
  };
}

/** The visual component = the PascalCase function export (matches the file name when possible). */
function pickComponent(
  mod: Record<string, unknown>,
  key: string,
): ComponentType<Record<string, unknown>> | null {
  const pascal = key
    .split("/")
    .pop()!
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const functions = Object.entries(mod).filter(
    ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
  );
  if (functions.length === 0) return null;
  const named = functions.find(([name]) => name === pascal);
  const chosen = named ?? functions[functions.length - 1]!;
  return chosen[1] as ComponentType<Record<string, unknown>>;
}

export const categories = catalog.map((c) => ({
  ...c,
  items: c.items.map((item) => ({
    ...item,
    ported: !!blocks[`${c.slug}/${item.file}`],
  })),
}));

export const stats = {
  categories: categories.length,
  blocks: categories.reduce((n, c) => n + c.items.length, 0),
  ported: Object.keys(blocks).length,
  variants: Object.values(blocks).reduce((n, b) => n + (b.meta.variants?.length ?? 0), 0),
};

export function findBlock(category: string, file: string): BlockEntry | undefined {
  return blocks[`${category}/${file}`];
}
