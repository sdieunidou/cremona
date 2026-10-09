/**
 * The @cremona/ui components the gallery shows: the items of the package's registry, and the demo
 * file of each (src/demos/<name>.tsx), loaded on demand in its own chunk.
 */
import type { ComponentType } from "react";
import registry from "@cremona/ui/registry.json";

export interface UiComponent {
  name: string;
  title: string;
  description: string;
  category: string;
  /** What the shadcn CLI prints after installing it, if there is something to know. */
  docs?: string;
}

export interface UiCategory {
  category: string;
  components: UiComponent[];
}

export const uiComponents: UiComponent[] = registry.items
  .filter((item) => item.type === "registry:ui")
  .map((item) => ({
    name: item.name,
    title: item.title,
    description: item.description,
    category: item.categories?.[0] ?? "other",
    docs: "docs" in item ? (item.docs as string) : undefined,
  }));

/** In registry order, grouped by their category. */
export const uiCategories: UiCategory[] = [...new Set(uiComponents.map((c) => c.category))].map(
  (category) => ({ category, components: uiComponents.filter((c) => c.category === category) }),
);

export function findComponent(name: string): UiComponent | undefined {
  return uiComponents.find((c) => c.name === name);
}

/** A demo file: each exported function is one example, titled by its name, in the order of the file. */
export type DemoModule = Record<string, ComponentType | unknown>;

const demoModules = import.meta.glob<DemoModule>("../demos/*.tsx");
const demoSources = import.meta.glob<string>("../demos/*.tsx", {
  query: "?raw",
  import: "default",
});

export const hasDemo = (name: string) => `../demos/${name}.tsx` in demoModules;

const cache = new Map<
  string,
  Promise<{ examples: { title: string; Example: ComponentType }[]; source: string }>
>();

/** "AsLink" → "As link". */
function titleOf(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The examples of a component and the text of the file they come from. */
export function loadDemo(name: string) {
  let entry = cache.get(name);
  if (!entry) {
    const load = demoModules[`../demos/${name}.tsx`];
    const loadSource = demoSources[`../demos/${name}.tsx`];
    if (!load || !loadSource) throw new Error(`no demo for ${name}`);
    entry = Promise.all([load(), loadSource()]).then(([module, source]) => {
      // in the order of the file, named by their declaration: a built bundle renames functions and
      // reorders the exports of a module
      const declared = [...source.matchAll(/^export (default )?function (\w+)/gm)];
      return {
        examples: declared.flatMap(([, isDefault, functionName]) => {
          const Example = module[isDefault ? "default" : functionName!];
          return typeof Example === "function"
            ? [{ title: titleOf(functionName!), Example: Example as ComponentType }]
            : [];
        }),
        source,
      };
    });
    cache.set(name, entry);
  }
  return entry;
}
