// @vitest-environment node
/** Generated templates: coherent with the blocks, and each one is its block's final render. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANIMATED, HELD } from "../../../tools/stimulus/annotate.mjs";
import { createRenderer } from "../../../tools/stimulus/ssr.mjs";
import {
  absoluteMedia,
  buildTemplate,
  namespaceIds,
  stripResourceHints,
  templatePrefix,
} from "../../../tools/stimulus/template.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "../../..");
const templatesDir = join(here, "../templates");
const blocksDir = join(repo, "packages/blocks/src");
const manifest = JSON.parse(readFileSync(join(templatesDir, "manifest.json"), "utf8"));

const dirs = (path) =>
  readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
const blocks = dirs(blocksDir).flatMap((category) =>
  dirs(join(blocksDir, category))
    .filter((file) => existsSync(join(blocksDir, category, file, "block.json")))
    .map((file) => `${category}/${file}`),
);
const blockJson = (key) => JSON.parse(readFileSync(join(blocksDir, key, "block.json"), "utf8"));
const template = (key, slug) => readFileSync(join(templatesDir, key, `${slug}.html`), "utf8");
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

describe("stimulus manifest", () => {
  it("lists every block with the variants of its block.json", () => {
    expect(Object.keys(manifest).sort()).toEqual([...blocks].sort());
    for (const key of blocks) {
      const expected = blockJson(key).variants.map((v) => ({
        label: v.label,
        slug: v.slug,
        size: v.size ?? null,
      }));
      expect(manifest[key].variants, key).toEqual(expected);
    }
  });

  it("has one template per variant and nothing else", () => {
    const expected = Object.entries(manifest).flatMap(([key, entry]) =>
      entry.variants.map((v) => `${key}/${v.slug}.html`),
    );
    const onDisk = files(templatesDir)
      .map((p) => relative(templatesDir, p))
      .filter((p) => p !== "manifest.json");
    expect(onDisk.sort()).toEqual(expected.sort());
  });

  it("flags the blocks whose React effects a template cannot replay", () => {
    for (const [key, entry] of Object.entries(manifest)) {
      expect(["full", "entrance-only"], key).toContain(entry.effects);
      expect(entry.effects === "entrance-only", key).toBe((entry.reactOnly ?? []).length > 0);
    }
    expect(manifest["geo/globe"].reactOnly).toContain("canvas");
    expect(manifest["ai/voice"].reactOnly).toEqual(expect.arrayContaining(["loops", "sequences"]));
    expect(manifest["metrics/stat-card"].effects).toBe("full");
  });
});

describe("stimulus templates", () => {
  const all = Object.entries(manifest).flatMap(([key, entry]) =>
    entry.variants.map((v) => ({ key, slug: v.slug, html: template(key, v.slug) })),
  );

  it("put the controller on the visual root", () => {
    for (const { key, slug, html } of all)
      expect(html.startsWith('<div data-controller="cremona-visual" '), `${key}/${slug}`).toBe(
        true,
      );
  });

  it("only animate properties the controller interpolates", () => {
    const seen = new Set();
    for (const { html } of all) {
      for (const [, from] of html.matchAll(/ data-anim-from="([^"]*)"/g))
        for (const declaration of decode(from).split(/;(?![^(]*\))/))
          seen.add(declaration.slice(0, declaration.indexOf(":")));
    }
    for (const prop of seen) expect(ANIMATED.has(prop) || HELD.has(prop), prop).toBe(true);
    expect(seen).toContain("opacity");
  });

  it("never share an id with another template", () => {
    const owner = new Map();
    for (const { key, slug, html } of all) {
      for (const [, id] of html.matchAll(/ id="([^"]+)"/g)) {
        const name = `${key}/${slug}`;
        expect(owner.get(id) ?? name, `id ${id}`).toBe(name);
        owner.set(id, name);
      }
    }
  });

  it("reference placeholder media from the site root", () => {
    for (const { key, slug, html } of all)
      expect(html, `${key}/${slug}`).not.toMatch(/\.\.\/media\//);
  });
});

// One block per category, plus the ones with ids, images, path draws, folded text or no root match.
const SAMPLE = [
  ...new Map(blocks.map((key) => [key.split("/")[0], key])).values(),
  "charts/line",
  "forms/login",
  "ecommerce/cart-drawer",
  "images/gallery",
  "ai/voice",
  "tasks/checklist",
  "geo/world-map",
];

describe("templates against the blocks (server-rendered)", () => {
  let renderer;
  const consoleError = console.error;
  beforeAll(async () => {
    renderer = await createRenderer(repo);
    // forms blocks render controlled inputs without onChange: React warns on every render
    console.error = (...args) => {
      if (!String(args[0]).startsWith("You provided a `value` prop")) consoleError(...args);
    };
  }, 60_000);
  afterAll(() => {
    console.error = consoleError;
    return renderer?.close();
  });

  it.each([...new Set(SAMPLE)])("%s: the markup is the final render, as generated", async (key) => {
    const { meta, Component, props } = await renderer.loadBlock(
      join(blocksDir, key),
      key.split("/")[1],
    );
    for (const v of meta.variants) {
      const committed = template(key, v.slug).trimEnd();
      const prefix = templatePrefix(key, v.slug);
      const final = renderer.render(Component, { ...props(v.label), animated: false }, prefix);
      const withoutAnimation = committed
        .replace(' data-controller="cremona-visual"', "")
        .replace(/ data-anim-(from|to|path)="[^"]*"/g, "");
      expect(withoutAnimation, `${key}/${v.slug}`).toBe(
        absoluteMedia(namespaceIds(stripResourceHints(final), prefix)),
      );
      const generated = buildTemplate(renderer, {
        Component,
        props: props(v.label),
        key,
        slug: v.slug,
        golden: readFileSync(join(blocksDir, key, "golden", `${v.slug}.html`), "utf8"),
      });
      expect(committed, `${key}/${v.slug} is up to date`).toBe(generated.html);
    }
  });
});
