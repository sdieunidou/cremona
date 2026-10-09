/**
 * The shadcn registry of @cremona/ui: packages/ui/registry.json lists the items by hand, packages/ui/r
 * is generated from it and from the sources (tools/generate-registry.mjs), and the `tokens` item
 * repeats the values of @cremona/tokens that the components rely on.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ui = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(ui, "..", "..");
const read = (...path: string[]) => readFileSync(join(...path), "utf8");

interface Item {
  name: string;
  type: string;
  files?: { path: string; type: string }[];
  registryDependencies?: string[];
  cssVars?: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}
const registry = JSON.parse(read(ui, "registry.json")) as { items: Item[] };

/** `--name: value` declarations of the first `selector { … }` block of a minified stylesheet */
function variables(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector}{`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const body = css.slice(start + selector.length + 1, css.indexOf("}", start));
  return Object.fromEntries(
    body
      .split(";")
      .filter(Boolean)
      .map((declaration) => {
        const colon = declaration.indexOf(":");
        return [
          declaration.slice(0, colon).trim().replace(/^--/, ""),
          declaration.slice(colon + 1).trim(),
        ];
      }),
  );
}

describe("the registry of @cremona/ui", () => {
  it("is generated from the sources: packages/ui/r is up to date", () => {
    const run = () =>
      execFileSync(process.execPath, [join(repo, "tools", "generate-registry.mjs"), "--check"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    expect(run).not.toThrow();
  });

  it("lists every component of src, and only them", () => {
    const listed = registry.items
      .flatMap((item) => item.files?.map((file) => file.path) ?? [])
      .sort();
    const sources = readdirSync(join(ui, "src"))
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => `src/${file}`)
      .sort();
    expect(listed).toEqual(sources);
  });

  it("has an item per file, named after it, and resolvable registry dependencies", () => {
    const names = new Set(registry.items.map((item) => item.name));
    expect(names.size).toBe(registry.items.length);
    for (const item of registry.items) {
      for (const file of item.files ?? [])
        if (item.type === "registry:ui") expect(file.path).toBe(`src/${item.name}.tsx`);
      for (const dependency of item.registryDependencies ?? [])
        expect(
          names.has(dependency.replace(/^@cremona\//, "")),
          `${item.name} → ${dependency}`,
        ).toBe(true);
    }
  });

  it("builds every item into packages/ui/r, with the source of its files", () => {
    for (const item of registry.items) {
      const built = JSON.parse(read(ui, "r", `${item.name}.json`)) as Item & {
        files?: { path: string; content: string }[];
      };
      expect(built.name).toBe(item.name);
      for (const file of built.files ?? []) {
        expect(file.content, file.path).not.toMatch(/from "\.\//);
        expect(file.content, file.path).not.toContain("@cremona/");
      }
    }
  });

  it("repeats the status tokens of @cremona/tokens in its tokens item", () => {
    const tokens = registry.items.find((item) => item.name === "tokens");
    expect(tokens?.type).toBe("registry:theme");
    const css = read(repo, "packages", "tokens", "css", "themes.css").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    const themes = variables(css, ":root");
    const dark = variables(css, ".dark");
    for (const [name, value] of Object.entries(tokens!.cssVars!.light))
      expect(themes[name], `light ${name}`).toBe(value);
    for (const [name, value] of Object.entries(tokens!.cssVars!.dark))
      expect(dark[name], `dark ${name}`).toBe(value);
    // the @theme mapping a Tailwind project needs: color-<token> → var(--token)
    const mapping = read(repo, "packages", "tokens", "css", "tailwind.css");
    for (const [name, value] of Object.entries(tokens!.cssVars!.theme))
      expect(mapping, name).toContain(`--${name}: ${value};`);
  });
});
