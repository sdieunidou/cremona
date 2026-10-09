/**
 * The shadcn registry of @cremona/ui.
 *
 *   packages/ui/registry.json   the items, by hand: name, type, dependencies, files (paths)
 *   packages/ui/r/<name>.json   generated: each item with the source of its files
 *   packages/ui/r/registry.json generated: the catalog
 *
 * The sources import each other relatively (`./utils.js`, `./field.js`) so that the npm package
 * compiles with plain tsc; the registry source says what a shadcn project resolves
 * (`@/lib/utils`, `@/components/ui/field`). It is what `shadcn build` writes, without the CLI.
 *
 *   node tools/generate-registry.mjs           write packages/ui/r
 *   node tools/generate-registry.mjs --check   fail when packages/ui/r is stale
 *
 * A project reads it with `shadcn registry add @cremona=<base>/{name}.json`, then
 * `shadcn add @cremona/button` (docs/ui.md).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const UI_DIR = join(here, "..", "packages", "ui");

/** What a registry source may import besides its siblings: a shadcn project has these or installs them. */
const BARE_IMPORTS = new Set([
  "react",
  "radix-ui",
  "class-variance-authority",
  "lucide-react",
  "clsx",
  "tailwind-merge",
]);

const ITEM_ORDER = [
  "$schema",
  "name",
  "type",
  "title",
  "description",
  "author",
  "dependencies",
  "devDependencies",
  "registryDependencies",
  "files",
  "tailwind",
  "cssVars",
  "css",
  "envVars",
  "docs",
  "categories",
  "meta",
];

/** The import specifiers of a source, as written. */
export function importsOf(source) {
  return [...source.matchAll(/^\s*(?:import|export)\b[^"';]*?\bfrom\s+"([^"]+)"/gm)].map(
    (m) => m[1],
  );
}

/** The npm package of a bare specifier: `radix-ui`, `@scope/name`, `lodash/fp` → `lodash`. */
export function packageOf(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** The npm packages a source imports, besides React (every app has it). */
export function packagesOf(source) {
  const packages = importsOf(source)
    .filter((specifier) => !specifier.startsWith("@/") && !specifier.startsWith("."))
    .map(packageOf);
  return [...new Set(packages)].filter((name) => name !== "react").sort();
}

/** A source the way a shadcn project resolves it. */
export function toRegistrySource(source, file, components) {
  const out = source.replace(/from "\.\/([a-z-]+)\.js"/g, (_, name) => {
    if (name === "utils") return 'from "@/lib/utils"';
    if (components.has(name)) return `from "@/components/ui/${name}"`;
    throw new Error(`${file}: imports ./${name}.js, which is not an item of the registry`);
  });
  for (const specifier of importsOf(out)) {
    if (specifier.startsWith("@/")) continue;
    if (!BARE_IMPORTS.has(packageOf(specifier)))
      throw new Error(`${file}: imports "${specifier}", which a registry source may not`);
  }
  return out;
}

const json = (value) => JSON.stringify(value, null, 2) + "\n";

/** { "<name>.json": content, "registry.json": content } for the registry in `dir`. */
export function buildRegistry(dir = UI_DIR) {
  const registry = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
  const names = new Set(registry.items.map((item) => item.name));
  const components = new Set(
    registry.items.filter((item) => item.type === "registry:ui").map((item) => item.name),
  );
  const out = {};
  for (const item of registry.items) {
    if (!/^[a-z][a-z0-9-]*$/.test(item.name))
      throw new Error(`item name "${item.name}" is not a slug`);
    for (const dep of item.registryDependencies ?? []) {
      const match = /^@cremona\/(.+)$/.exec(dep);
      if (!match || !names.has(match[1]))
        throw new Error(`${item.name}: unknown registry dependency ${dep}`);
    }
    const files = item.files?.map((file) => ({
      path: file.path,
      content: toRegistrySource(readFileSync(join(dir, file.path), "utf8"), file.path, components),
      type: file.type,
      ...(file.target ? { target: file.target } : {}),
    }));
    const imported = [...new Set((files ?? []).flatMap((file) => packagesOf(file.content)))].sort();
    const declared = [...(item.dependencies ?? [])].sort();
    if (imported.join() !== declared.join())
      throw new Error(
        `${item.name}: dependencies are [${declared}], its files import [${imported}]`,
      );
    const built = { $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item, files };
    if (!built.files) delete built.files;
    out[`${item.name}.json`] = json(
      Object.fromEntries(ITEM_ORDER.filter((key) => key in built).map((key) => [key, built[key]])),
    );
  }
  out["registry.json"] = json(registry);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const expected = buildRegistry();
  const target = join(UI_DIR, "r");
  if (check) {
    const stale = [];
    const onDisk = existsSync(target) ? readdirSync(target) : [];
    for (const [file, content] of Object.entries(expected))
      if (!onDisk.includes(file) || readFileSync(join(target, file), "utf8") !== content)
        stale.push(file);
    for (const file of onDisk) if (!(file in expected)) stale.push(file);
    if (stale.length) {
      console.error(
        `registry: stale files in packages/ui/r: ${stale.join(", ")} — run pnpm generate:registry`,
      );
      process.exit(1);
    }
    console.log(`registry: ${Object.keys(expected).length - 1} items up to date`);
  } else {
    rmSync(target, { recursive: true, force: true });
    mkdirSync(target, { recursive: true });
    for (const [file, content] of Object.entries(expected))
      writeFileSync(join(target, file), content);
    console.log(`registry: ${Object.keys(expected).length - 1} items written to packages/ui/r`);
  }
}
