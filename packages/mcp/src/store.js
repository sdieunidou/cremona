/** Cremona library store — filesystem access to blocks, tokens and docs. */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(here, "..", "..", "..");

/**
 * True when the server runs from a cremona checkout. A published package reads the
 * snapshot that `scripts/bundle-data.mjs` copies into `data/` (same layout) instead,
 * and the authoring tools, which write into the library, are not registered.
 */
export const IN_REPO = existsSync(join(monorepoRoot, "packages", "blocks", "catalog.json"));
export const REPO_ROOT = IN_REPO ? monorepoRoot : join(here, "..", "data");
export const BLOCKS_DIR = join(REPO_ROOT, "packages", "blocks", "src");
export const TOKENS_DIR = join(REPO_ROOT, "packages", "tokens");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readText(path) {
  return readFileSync(path, "utf8");
}

/** Slugs of categories, block files and guide names: lowercase words joined by hyphens. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let catalogCache = null;
let manifestCache = null;

/** Forget cached catalog/manifest reads (after the authoring tools write). */
export function invalidateCaches() {
  catalogCache = null;
  manifestCache = null;
}

export function catalog() {
  if (!catalogCache) catalogCache = readJson(join(REPO_ROOT, "packages", "blocks", "catalog.json"));
  return catalogCache;
}

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

/** The block's props reference (api.json, written by tools/generate-api.mjs). */
export function blockApi(categorySlug, file) {
  const p = join(blockDir(categorySlug, file), "api.json");
  return existsSync(p) ? readJson(p) : null;
}

export function blockReactSource(categorySlug, file) {
  const p = join(blockDir(categorySlug, file), "react.tsx");
  return existsSync(p) ? readText(p) : null;
}

export function blockGoldenSlugs(categorySlug, file) {
  const dir = join(blockDir(categorySlug, file), "golden");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .sort();
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

/** One stylesheet of @cremona/tokens/css (cremona.css, tailwind.css, cremona.scoped.css…). */
export function tokensCss(file) {
  return readText(join(TOKENS_DIR, "css", file));
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
  if (!SLUG.test(name)) return null;
  const p = join(REPO_ROOT, "docs", `${name}.md`);
  return existsSync(p) ? readText(p) : null;
}

export const SCALES = ["real-size", "miniature", "illustration"];

// Measured sizes (text 12–16 px, controls 32–44 px vs 7–10 px text): the kit
// categories are real-size templates, sections and layouts are thumbnail-scale
// wireframes, and every other category is animated product artwork.
const REAL_SIZE_CATEGORIES = new Set(["components", "ecommerce", "forms", "mobile", "notices"]);
const MINIATURE_CATEGORIES = new Set(["sections", "layouts"]);
const SCALE_OVERRIDES = {
  "ecommerce/product-grid": "miniature",
  "ecommerce/cart-drawer": "miniature",
};

/** How a block renders: "real-size" UI, a "miniature" wireframe, or an "illustration". */
export function blockScale(categorySlug, file) {
  const override = SCALE_OVERRIDES[`${categorySlug}/${file}`];
  if (override) return override;
  if (REAL_SIZE_CATEGORIES.has(categorySlug)) return "real-size";
  if (MINIATURE_CATEGORIES.has(categorySlug)) return "miniature";
  return "illustration";
}

/** The component a block's react.tsx exports (one PascalCase function per block). */
export function blockExportName(categorySlug, file) {
  const source = blockReactSource(categorySlug, file);
  return source ? (/^export function ([A-Z]\w*)/m.exec(source)?.[1] ?? null) : null;
}

/** Public package path of a block: `@cremona/blocks/<category>/<file>`. */
export function blockImportPath(categorySlug, file) {
  return `@cremona/blocks/${categorySlug}/${file}`;
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
        scale: blockScale(group.slug, item.file),
        added: item.added,
        variants: meta?.variants?.map((v) => v.label) ?? [],
        cols: meta?.page?.cols ?? 2,
      });
    }
  }
  return out;
}

/** The catalog group a category slug or name designates, if any. */
export function findCategory(category) {
  const wanted = category.trim().toLowerCase();
  return catalog().find((g) => g.slug === wanted || g.category.toLowerCase() === wanted);
}

/** Words that describe the request, not the block ("settings page" is the settings block). */
const FILLER = new Set(
  "a an the of for with and or to in on my our some any page pages screen screens view ui block blocks visual visuals".split(
    " ",
  ),
);

/**
 * Multi-word ways of saying one thing, folded into one term before splitting.
 * @type {[RegExp, string][]}
 */
const PHRASES = [
  [/\b(sign|log)[ -](in|on)\b/g, "login"],
  [/\bsign[ -]up\b/g, "signup"],
  [/\bnot[ -]found\b/g, "notfound"],
  [/\b(cmd|ctrl|command|meta)[ +-]?k\b/g, "cmdk"],
];

/** Query term → other ways the library says it. */
const SYNONYMS = {
  404: ["not found", "not-found"],
  notfound: ["not found", "not-found"],
  pie: ["donut"],
  doughnut: ["donut"],
  graph: ["chart"],
  plot: ["chart"],
  login: ["sign-in", "sign in", "auth"],
  logon: ["login", "sign in", "auth"],
  signin: ["login", "sign-in", "sign in", "auth"],
  signup: ["sign up", "registration", "register"],
  register: ["signup", "registration"],
  registration: ["signup", "register"],
  authentication: ["auth", "login"],
  preference: ["settings"],
  setting: ["settings", "preferences"],
  modal: ["dialog"],
  popup: ["dialog", "popover", "tooltip"],
  dropdown: ["menu", "select"],
  combobox: ["select", "command"],
  navbar: ["header", "navigation", "app bar"],
  topbar: ["header", "app bar"],
  nav: ["navigation", "breadcrumb", "tab bar", "sidebar"],
  snackbar: ["toast"],
  notification: ["toast", "bell", "alert"],
  banner: ["callout", "alert"],
  slider: ["carousel"],
  spinner: ["loading", "progress"],
  loader: ["loading", "progress", "skeleton"],
  toggle: ["switch"],
  kpi: ["stat", "metric"],
  metric: ["stat"],
  cmdk: ["command"],
  shortcut: ["kbd", "keyboard"],
  keyboard: ["kbd", "shortcut"],
  payment: ["checkout", "billing", "credit card"],
  billing: ["usage", "checkout", "payment"],
  invoice: ["checkout", "billing", "order"],
  shop: ["ecommerce", "product", "cart"],
  store: ["ecommerce", "product", "cart"],
  landing: ["marketing", "hero"],
  wizard: ["onboarding", "step"],
  stepper: ["step", "wizard", "process"],
  map: ["globe", "geo"],
  user: ["avatar", "profile", "team"],
};

/** Conservative English singular: "buttons" → "button", "categories" → "category". */
function singular(term) {
  if (term.length <= 3 || /(ss|us|is)$/.test(term)) return term;
  if (term.endsWith("ies")) return `${term.slice(0, -3)}y`;
  if (/(sses|xes|ches|shes)$/.test(term)) return term.slice(0, -2);
  return term.endsWith("s") ? term.slice(0, -1) : term;
}

/** Every spelling one query term stands for; a synonym counts half as much as the term itself. */
function alternativesOf(term) {
  const base = singular(term);
  const synonyms = (SYNONYMS[term] ?? SYNONYMS[base] ?? []).filter((s) => s !== term && s !== base);
  return [
    { spelling: term, weight: 1 },
    ...(base === term ? [] : [{ spelling: base, weight: 1 }]),
    ...synonyms.map((spelling) => ({ spelling, weight: 0.5 })),
  ];
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * How well `term` matches a word of `text`: 1 for the whole word (or its plural),
 * 0.5 for the start of a longer word ("table" in "tablet"), 0 otherwise, so "ai"
 * matches "AI Chat" but not "email".
 */
function wordMatch(text, term) {
  const t = escapeRegex(term);
  if (new RegExp(`(^|[^a-z0-9])${t}(e?s)?([^a-z0-9]|$)`).test(text)) return 1;
  return new RegExp(`(^|[^a-z0-9])${t}`).test(text) ? 0.5 : 0;
}

/** Score of one spelling against one block. 0 = no match. */
function scoreSpelling(block, term) {
  const name = block.name.toLowerCase();
  const category = block.category.toLowerCase();
  let score = wordMatch(name, term) * (name === term || block.file === term ? 18 : 10);
  score += wordMatch(block.file, term) * 6;
  score += wordMatch(block.description.toLowerCase(), term) * 4;
  score += Math.max(0, ...block.variants.map((v) => wordMatch(v.toLowerCase(), term))) * 3;
  score += category === term || singular(category) === term ? 5 : wordMatch(category, term) * 1;
  return score;
}

/** Best score of a query term over its spellings (itself, singular, synonyms). */
function scoreTerm(block, term) {
  return Math.max(
    ...alternativesOf(term).map(({ spelling, weight }) => scoreSpelling(block, spelling) * weight),
  );
}

/** Most blocks a search returns when none matches every word and it falls back to partial matches. */
const PARTIAL_LIMIT = 10;

/**
 * Blocks matching every term of `query`, best first. When no block matches them
 * all, the blocks matching the most terms come back instead, each flagged
 * `partial: true` with the `unmatched` terms, so a two-word query that only one
 * block half-answers ("pricing table") never reads as "nothing exists".
 * @param {string} query
 * @param {{ category?: string, kind?: string, scale?: string, limit?: number }} [options]
 */
export function searchBlocks(query, { category, kind, scale, limit = 30 } = {}) {
  let q = query.trim().toLowerCase().replace(/\s+/g, " ");
  for (const [pattern, term] of PHRASES) q = q.replace(pattern, term);
  const group = category ? findCategory(category) : null;
  let items = blockIndex();
  if (category) items = items.filter((b) => b.categorySlug === group?.slug);
  if (kind) items = items.filter((b) => b.kind === kind);
  if (scale) items = items.filter((b) => b.scale === scale);
  if (!q) return items.slice(0, limit);

  // Terms are matched individually (as words, in any order) and ANDed.
  const words = q.split(/[^a-z0-9-]+/).filter(Boolean);
  const meaningful = words.filter((w) => !FILLER.has(w));
  const terms = meaningful.length ? meaningful : words;
  if (!terms.length) return [];
  const scored = items.map((block) => {
    const termScores = terms.map((term) => scoreTerm(block, term));
    return { block, termScores, score: termScores.reduce((sum, s) => sum + s, 0) };
  });

  const matchesAll = scored.filter(({ termScores }) => termScores.every((s) => s > 0));
  if (matchesAll.length || terms.length < 2) {
    return matchesAll
      .map(({ block, score }) => ({
        ...block,
        // The whole query as one phrase stays the strongest signal, so "stat card"
        // ranks metrics/stat-card above blocks that merely mention both words.
        score: terms.length > 1 && scoreSpelling(block, terms.join(" ")) > 0 ? score + 10 : score,
      }))
      .sort((a, z) => z.score - a.score)
      .slice(0, limit);
  }

  return scored
    .filter(({ score }) => score > 0)
    .map(({ block, termScores, score }) => ({
      matched: termScores.filter((s) => s > 0).length,
      result: {
        ...block,
        score,
        partial: true,
        unmatched: terms.filter((_, i) => termScores[i] === 0),
      },
    }))
    .sort((a, z) => z.matched - a.matched || z.result.score - a.result.score)
    .slice(0, Math.min(limit, PARTIAL_LIMIT))
    .map(({ result }) => result);
}

export function categorySummary() {
  return catalog().map((group) => ({
    category: group.category,
    slug: group.slug,
    blocks: group.items.length,
    items: group.items.map((i) => i.name),
  }));
}

/**
 * Block keys that have a parity test (`runGoldenParity("<key>", …)` in
 * packages/blocks/test), or null when the tests are not shipped (published package).
 */
export function parityTestKeys() {
  const dir = join(REPO_ROOT, "packages", "blocks", "test");
  if (!existsSync(dir)) return null;
  const keys = new Set();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".parity.test.tsx")) continue;
    for (const m of readText(join(dir, f)).matchAll(/runGoldenParity\(\s*["']([^"']+)["']/g))
      keys.add(m[1]);
  }
  return keys;
}

/** Coherence validation across catalog, blocks, goldens, preview props, props references, stimulus templates and parity tests. */
export function validate() {
  const issues = [];
  const index = blockIndex();
  const manifest = stimulusManifest();
  const parity = parityTestKeys();
  for (const b of index) {
    const dir = blockDir(b.categorySlug, b.file);
    const meta = blockMeta(b.categorySlug, b.file);
    if (!meta) {
      issues.push(`MISSING_META: ${b.key} has no block.json`);
      continue;
    }
    if (!existsSync(join(dir, "react.tsx")))
      issues.push(`MISSING_REACT: ${b.key} has no react.tsx`);
    const props = blockPreviewProps(b.categorySlug, b.file);
    if (!props) issues.push(`MISSING_PREVIEW_PROPS: ${b.key} has no preview-props.json`);
    if (!blockApi(b.categorySlug, b.file))
      issues.push(`MISSING_API: ${b.key} (run pnpm generate:api)`);
    const stim = manifest[b.key];
    if (!stim) issues.push(`MISSING_STIMULUS: ${b.key} (run pnpm generate:stimulus)`);
    for (const v of meta.variants) {
      if (!existsSync(join(dir, "golden", `${v.slug}.html`)))
        issues.push(`MISSING_GOLDEN: ${b.key} · ${v.label} (${v.slug})`);
      if (props && !Object.hasOwn(props, v.label))
        issues.push(
          `MISSING_PREVIEW_PROPS: ${b.key} · ${v.label} (add its props to preview-props.json)`,
        );
      if (!stim) continue;
      const template = stim.variants?.find((t) => t.label === v.label);
      if (!template || !stimulusTemplate(b.categorySlug, b.file, template.slug))
        issues.push(`MISSING_STIMULUS: ${b.key} · ${v.label} (run pnpm generate:stimulus)`);
    }
    if (props) {
      const labels = new Set(meta.variants.map((v) => v.label));
      for (const label of Object.keys(props))
        if (!labels.has(label))
          issues.push(
            `ORPHAN_PREVIEW_PROPS: ${b.key} · ${label} has props but is not a variant of block.json`,
          );
    }
    if (parity && !parity.has(b.key))
      issues.push(
        `MISSING_PARITY_TEST: ${b.key} (packages/blocks/test/${b.categorySlug}-${b.file}.parity.test.tsx)`,
      );
  }
  const orphans = listBlockDirs().filter((k) => !index.some((b) => b.key === k));
  for (const k of orphans) issues.push(`ORPHAN_BLOCK: ${k} exists on disk but not in catalog.json`);
  return {
    blocks: index.length,
    variants: index.reduce((n, b) => n + b.variants.length, 0),
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
