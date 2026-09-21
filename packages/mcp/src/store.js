/** Cremona library store — filesystem access to blocks, tokens and docs. */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const BLOCKS_DIR = join(REPO_ROOT, "packages", "blocks", "src");
export const TOKENS_DIR = join(REPO_ROOT, "packages", "tokens");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readText(path) {
  return readFileSync(path, "utf8");
}

let catalogCache = null;
export function catalog() {
  if (!catalogCache) catalogCache = readJson(join(REPO_ROOT, "packages", "blocks", "catalog.json"));
  return catalogCache;
}

let manifestCache = null;
export function stimulusManifest() {
  if (!manifestCache) {
    const p = join(REPO_ROOT, "packages", "stimulus", "templates", "manifest.json");
    manifestCache = existsSync(p) ? readJson(p) : {};
  }
  return manifestCache;
}

export function blockDir(categorySlug, file) {
  return join(BLOCKS_DIR, categorySlug, file);
}

export function blockMeta(categorySlug, file) {
  const p = join(blockDir(categorySlug, file), "block.json");
  return existsSync(p) ? readJson(p) : null;
}

export function blockPreviewProps(categorySlug, file) {
  const p = join(blockDir(categorySlug, file), "preview-props.json");
  return existsSync(p) ? readJson(p) : null;
}

export function blockReactSource(categorySlug, file) {
  const p = join(blockDir(categorySlug, file), "react.tsx");
  return existsSync(p) ? readText(p) : null;
}

export function blockGoldenSlugs(categorySlug, file) {
  const dir = join(blockDir(categorySlug, file), "golden");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
}

export function goldenContent(categorySlug, file, slug) {
  const p = join(blockDir(categorySlug, file), "golden", `${slug}.html`);
  return existsSync(p) ? readText(p) : null;
}

export function stimulusTemplates(categorySlug, file) {
  return stimulusManifest()[`${categorySlug}/${file}`]?.variants ?? [];
}

export function stimulusTemplate(categorySlug, file, slug) {
  const p = join(
    REPO_ROOT,
    "packages",
    "stimulus",
    "templates",
    categorySlug,
    file,
    `${slug}.html`,
  );
  return existsSync(p) ? readText(p) : null;
}

export function themes() {
  return readJson(join(TOKENS_DIR, "themes.json"));
}

export function themeCss() {
  return readText(join(TOKENS_DIR, "css", "themes.css"));
}

export function designSystemCss() {
  return readText(join(TOKENS_DIR, "css", "cremona.css"));
}

/** All docs (name -> markdown) from docs/. */
export function docs() {
  const dir = join(REPO_ROOT, "docs");
  const out = {};
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".md")) out[f.replace(/\.md$/, "")] = readText(join(dir, f));
  }
  return out;
}

export function doc(name) {
  const p = join(REPO_ROOT, "docs", `${name}.md`);
  return existsSync(p) ? readText(p) : null;
}

/** Flattened block index for list/search tools. */
export function blockIndex() {
  const out = [];
  for (const group of catalog()) {
    for (const item of group.items) {
      const meta = blockMeta(group.slug, item.file);
      out.push({
        key: `${group.slug}/${item.file}`,
        category: group.category,
        categorySlug: group.slug,
        file: item.file,
        name: item.name,
        description: item.description,
        kind: meta?.kind ?? item.kind ?? "block",
        added: item.added,
        ported: !!meta,
        variants: meta?.variants?.map((v) => v.label) ?? [],
        cols: meta?.page?.cols ?? 2,
      });
    }
  }
  return out;
}

export function searchBlocks(query, { category, kind, limit = 30 } = {}) {
  const q = query.trim().toLowerCase();
  let items = blockIndex();
  if (category) items = items.filter((b) => b.categorySlug === category || b.category.toLowerCase() === category.toLowerCase());
  if (kind) items = items.filter((b) => b.kind === kind);
  if (q) {
    items = items
      .map((b) => {
        let score = 0;
        if (b.name.toLowerCase().includes(q)) score += 10;
        if (b.file.includes(q)) score += 6;
        if (b.description.toLowerCase().includes(q)) score += 4;
        if (b.variants.some((v) => v.toLowerCase().includes(q))) score += 3;
        if (b.category.toLowerCase().includes(q)) score += 1;
        return { ...b, score };
      })
      .filter((b) => b.score > 0)
      .sort((a, z) => z.score - a.score);
  }
  return items.slice(0, limit);
}

export function categorySummary() {
  return catalog().map((group) => ({
    category: group.category,
    slug: group.slug,
    blocks: group.items.length,
    items: group.items.map((i) => i.name),
  }));
}

/** Coherence validation across catalog, blocks, goldens and stimulus templates. */
export function validate() {
  const issues = [];
  const index = blockIndex();
  for (const b of index) {
    const dir = blockDir(b.categorySlug, b.file);
    if (!b.ported) {
      issues.push(`MISSING_REACT: ${b.key} has no react.tsx`);
      continue;
    }
    const meta = blockMeta(b.categorySlug, b.file);
    for (const v of meta.variants) {
      if (!existsSync(join(dir, "golden", `${v.slug}.html`))) {
        issues.push(`MISSING_GOLDEN: ${b.key} · ${v.label} (${v.slug})`);
      }
    }
    if (!existsSync(join(dir, "preview-props.json"))) {
      issues.push(`MISSING_PREVIEW_PROPS: ${b.key} (run the blocks test suite to generate)`);
    }
    const stim = stimulusManifest()[b.key];
    if (!stim) issues.push(`MISSING_STIMULUS: ${b.key} (run node tools/generate-stimulus.mjs)`);
  }
  const reactBlocks = listBlockDirs().filter((k) => !index.some((b) => b.key === k));
  for (const k of reactBlocks) issues.push(`ORPHAN_BLOCK: ${k} exists on disk but not in catalog.json`);
  return {
    blocks: index.length,
    ported: index.filter((b) => b.ported).length,
    issues,
    ok: issues.length === 0,
  };
}

export function listBlockDirs() {
  const out = [];
  for (const cat of readdirSync(BLOCKS_DIR)) {
    const catPath = join(BLOCKS_DIR, cat);
    if (!statSync(catPath).isDirectory()) continue;
    for (const file of readdirSync(catPath)) {
      if (statSync(join(catPath, file)).isDirectory()) out.push(`${cat}/${file}`);
    }
  }
  return out;
}

export { relative };
