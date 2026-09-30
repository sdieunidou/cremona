#!/usr/bin/env node
/**
 * Generate the Stimulus templates from the React blocks.
 *
 * For every block and variant: server-render the final state (`animated={false}`)
 * as the template markup, pair it with the initial render (checked against the
 * golden) to annotate the animated elements, and write
 * packages/stimulus/templates/<category>/<file>/<slug>.html plus manifest.json.
 *
 * All-or-nothing: any error exits 1 before anything is written. Templates that
 * no longer correspond to a variant are deleted.
 *
 * Usage: node tools/generate-stimulus.mjs
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { reactOnlyEffects } from "./stimulus/effects.mjs";
import { createRenderer } from "./stimulus/ssr.mjs";
import { buildTemplate } from "./stimulus/template.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKS = join(ROOT, "packages", "blocks", "src");
const OUT = join(ROOT, "packages", "stimulus", "templates");

const dirs = (path) =>
  readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

const errors = [];
const warnings = new Map();
const outputs = new Map();
const manifest = {};
let animated = 0;

// React logs development warnings (e.g. a controlled input without onChange) once per render.
const consoleError = console.error;
let current = "";
console.error = (...args) => {
  const message = String(args[0]).split("\n")[0];
  if (!warnings.has(message)) warnings.set(message, new Set());
  warnings.get(message).add(current);
};

const renderer = await createRenderer(ROOT);
try {
  for (const category of dirs(BLOCKS)) {
    for (const file of dirs(join(BLOCKS, category))) {
      const dir = join(BLOCKS, category, file);
      if (!existsSync(join(dir, "block.json"))) continue;
      const key = `${category}/${file}`;
      current = key;
      let block;
      try {
        block = await renderer.loadBlock(dir, file);
      } catch (err) {
        errors.push(`${key}: ${err.message}`);
        continue;
      }
      const { meta, Component, props } = block;
      const finals = [];
      const variants = [];
      for (const variant of meta.variants) {
        try {
          const goldenPath = join(dir, "golden", `${variant.slug}.html`);
          if (!existsSync(goldenPath)) throw new Error("missing golden");
          const template = buildTemplate(renderer, {
            Component,
            props: props(variant.label),
            key,
            slug: variant.slug,
            golden: readFileSync(goldenPath, "utf8"),
          });
          outputs.set(join(OUT, category, file, `${variant.slug}.html`), template.html + "\n");
          finals.push(template.final);
          animated += template.animated;
          variants.push({ label: variant.label, slug: variant.slug, size: variant.size ?? null });
        } catch (err) {
          errors.push(`${key} ${variant.slug}: ${err.message}`);
        }
      }
      const reactOnly = reactOnlyEffects(readFileSync(join(dir, "react.tsx"), "utf8"), finals);
      manifest[key] = {
        name: meta.name,
        description: meta.description,
        kind: meta.kind,
        category,
        file,
        effects: reactOnly.length ? "entrance-only" : "full",
        ...(reactOnly.length ? { reactOnly } : {}),
        variants,
      };
    }
  }
} finally {
  console.error = consoleError;
  await renderer.close();
}

if (errors.length) {
  console.error(`stimulus templates: ${errors.length} error(s), nothing written`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

/** Every file under `dir`, recursively. */
function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const manifestPath = join(OUT, "manifest.json");
let stale = 0;
for (const path of files(OUT)) {
  if (path !== manifestPath && !outputs.has(path)) {
    rmSync(path);
    stale++;
  }
}
const removeEmpty = (dir) => {
  for (const name of dirs(dir)) removeEmpty(join(dir, name));
  if (dir !== OUT && readdirSync(dir).length === 0) rmdirSync(dir);
};
if (existsSync(OUT)) removeEmpty(OUT);

for (const [path, html] of outputs) {
  if (existsSync(path) && readFileSync(path, "utf8") === html) continue;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const entranceOnly = Object.values(manifest).filter((b) => b.effects === "entrance-only").length;
console.log(
  `stimulus templates: ${outputs.size} variants across ${Object.keys(manifest).length} blocks ` +
    `(${animated} animated elements; ${entranceOnly} blocks entrance-only` +
    `${stale ? `; ${stale} stale file(s) removed from ${relative(ROOT, OUT)}` : ""})`,
);
if (warnings.size) {
  console.log(`React warnings during rendering (${warnings.size}):`);
  for (const [message, keys] of warnings)
    console.log(`  ${message} — ${[...keys].slice(0, 6).join(", ")}${keys.size > 6 ? ", …" : ""}`);
}
