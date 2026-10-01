/**
 * Filesystem discovery of all blocks (single source of truth: packages/blocks/src).
 * Only the catalog and the thumbnail defaults are bundled eagerly; each block's
 * component, block.json and preview props load on demand, in their own chunks.
 */
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
  variants: { label: string; slug: string; size?: string | null }[];
}

export interface CatalogItem {
  file: string;
  name: string;
  description: string;
  added: string;
  kind?: string;
  categorySlug?: string;
}

export interface CatalogGroup {
  category: string;
  slug: string;
  items: CatalogItem[];
}

type Visual = ComponentType<Record<string, unknown>>;

/** One prop or field, as `tools/generate-api.mjs` reads it from the block's source. */
export interface ApiMember {
  name: string;
  type: string;
  optional: boolean;
  default?: string;
  description?: string;
  deprecated?: boolean;
  /** Interface the prop is inherited from (`VisualProps`). */
  from?: string;
}

/** A block's props reference (`api.json`). */
export interface BlockApi {
  component: string;
  props: ApiMember[];
  types: { name: string; props?: ApiMember[]; type?: string }[];
}

const catalogModule = import.meta.glob<{ default: CatalogGroup[] }>(
  "../../../../packages/blocks/catalog.json",
  { eager: true },
);
const thumbsModule = import.meta.glob<{ default: Record<string, Record<string, unknown>> }>(
  "../../../../packages/blocks/thumbnail-defaults.json",
  { eager: true },
);
const reactModules = import.meta.glob<Record<string, unknown>>(
  "../../../../packages/blocks/src/*/*/react.tsx",
);
const metaModules = import.meta.glob<BlockJsonMeta>(
  "../../../../packages/blocks/src/*/*/block.json",
  { import: "default" },
);
const propsModules = import.meta.glob<Record<string, Record<string, unknown>>>(
  "../../../../packages/blocks/src/*/*/preview-props.json",
  { import: "default" },
);

const apiModules = import.meta.glob<BlockApi>("../../../../packages/blocks/src/*/*/api.json", {
  import: "default",
});

const blockPath = (key: string, file: string) => `../../../../packages/blocks/src/${key}/${file}`;

export const catalog: CatalogGroup[] = Object.values(catalogModule)[0]?.default ?? [];
export const categories = catalog;

export const thumbnails: Record<string, Record<string, unknown>> = Object.values(thumbsModule)[0]
  ?.default ?? {};

export const stats = {
  categories: catalog.length,
  blocks: catalog.reduce((n, c) => n + c.items.length, 0),
  variants: __CREMONA_VARIANTS__,
};

/** The catalog entry of a block, or undefined when the key names no block. */
export function findItem(
  category: string,
  file: string,
): { group: CatalogGroup; item: CatalogItem } | undefined {
  const group = catalog.find((c) => c.slug === category);
  const item = group?.items.find((i) => i.file === file);
  return group && item && hasBlock(`${category}/${file}`) ? { group, item } : undefined;
}

/** True when the block has a react.tsx and a block.json on disk. */
export function hasBlock(key: string): boolean {
  return blockPath(key, "react.tsx") in reactModules && blockPath(key, "block.json") in metaModules;
}

export const blockKeys: string[] = catalog.flatMap((c) =>
  c.items.map((i) => `${c.slug}/${i.file}`).filter(hasBlock),
);

export interface BlockComponent {
  /** Name of the module export (what a consumer imports). */
  exportName: string;
  Component: Visual;
}

export interface BlockEntry extends BlockComponent {
  key: string;
  meta: BlockJsonMeta;
  previewProps: Record<string, Record<string, unknown>>;
  api: BlockApi | null;
}

const components = new Map<string, Promise<BlockComponent>>();
const entries = new Map<string, Promise<BlockEntry>>();

/** A block's component, loaded once (the same promise every time, for React's `use`). */
export function loadComponent(key: string): Promise<BlockComponent> {
  let promise = components.get(key);
  if (!promise) {
    const load = reactModules[blockPath(key, "react.tsx")];
    promise = load
      ? load().then((mod) => pickComponent(mod, key))
      : Promise.reject(new Error(`No visual named ${key}`));
    components.set(key, promise);
  }
  return promise;
}

/** Everything a block page needs: component, block.json, preview props and props reference. */
export function loadBlock(key: string): Promise<BlockEntry> {
  let promise = entries.get(key);
  if (!promise) {
    const meta = metaModules[blockPath(key, "block.json")];
    const props = propsModules[blockPath(key, "preview-props.json")];
    const api = apiModules[blockPath(key, "api.json")];
    promise = meta
      ? Promise.all([loadComponent(key), meta(), props ? props() : {}, api ? api() : null]).then(
          ([component, meta, previewProps, api]) => ({
            key,
            ...component,
            meta,
            previewProps,
            api,
          }),
        )
      : Promise.reject(new Error(`No visual named ${key}`));
    entries.set(key, promise);
  }
  return promise;
}

/**
 * The visual component = the PascalCase function export (every block has exactly one). When that
 * name is a deprecated alias (`export { ErrorState as Error }`), the name it aliases is used.
 */
function pickComponent(mod: Record<string, unknown>, key: string): BlockComponent {
  const functions = Object.entries(mod).filter(
    ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
  );
  const pascal = key
    .split("/")
    .pop()!
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const match = functions.find(([name]) => name === pascal) ?? functions[0];
  if (!match) throw new Error(`${key}/react.tsx exports no component`);
  const [exportName, Component] =
    functions.find(([name, value]) => value === match[1] && name !== match[0]) ?? match;
  return { exportName, Component: Component as Visual };
}
