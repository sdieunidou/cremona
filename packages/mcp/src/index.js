/** Cremona MCP server — exposes the visual library + design system to AI sessions. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as store from "./store.js";
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./store.js";

/**
 * Sent back on `initialize`; MCP clients put it in the model's context. This is
 * the one place a session is guaranteed to read — it never calls
 * `get_guide("react")` on its own — so the preview-vs-production warning lives
 * here, not only in the docs.
 */
const library = store.blockIndex();
const INSTRUCTIONS = `Cremona — ${library.length} animated visual blocks (${store.catalog().length} categories, ${library.reduce((n, b) => n + b.variants.length, 0)} variants), a design
system (${store.themes().length} themes x light/dark) and authoring tools.

BLOCKS ARE PREVIEW COMPOSITIONS, NOT PRODUCTION COMPONENTS. Every block:
- has aria-hidden="true" on its root, so its content does not exist for a
  screen reader;
- sits in the gallery's preview frame, which centres a max-w-* card inside
  whatever box you give it;
- takes content props (label, value, items…) and no onClick, no ref, no
  children — components/button renders one button with one label.

Two correct ways to use one:

1. AS-IS, for illustration (charts, stat cards, empty states): give it a sized
   box, pass real data instead of the demo defaults, and put a text equivalent
   next to it, since the root is aria-hidden. In a layout, add \`fill\` so the
   block occupies its cell instead of centring a capped-width card — otherwise
   panels side by side get different widths and edges.

2. DERIVED, for anything interactive: take the source from
   get_block(include:["react"]), then remove the preview frame wrapper and the
   useInView plumbing, add children/handlers/ref/ARIA/keyboard, and KEEP the
   class strings and the motion variants. Rewriting a block from its class
   strings silently drops every entrance animation in the library.

Call get_guide("react") for the derivation recipe, the props contract and the
gotchas — the \`gradient\` veil hides the bottom 64px of a card, and entrance
chains run ~1.3s, which screenshot tests must wait out. Before adding blocks,
read get_guide("porting-guide") or get_guide("authoring-guide").

Ship @cremona/tokens/css/cremona.css once; no Tailwind build required.`;

const server = new McpServer(
  {
    name: "cremona",
    version: "0.1.0",
  },
  { instructions: INSTRUCTIONS },
);

const text = (data) => ({
  content: [
    { type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) },
  ],
});

/** A tool error, flagged as such to the client, with what the caller can use instead. */
const fail = (error, extra = {}) => ({
  content: [{ type: "text", text: JSON.stringify({ error, ...extra }, null, 2) }],
  isError: true,
});

/** "<category>/<file>" → [category, file], or null when it is not two slugs. */
function parseKey(key) {
  const parts = key.split("/");
  return parts.length === 2 && parts.every((p) => store.SLUG.test(p)) ? parts : null;
}

/** A variant by label, by slug, or by label regardless of case and spacing. */
function findVariant(meta, variant) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  return (
    meta.variants.find((v) => v.label === variant) ??
    meta.variants.find((v) => v.slug === variant) ??
    meta.variants.find((v) => norm(v.label) === norm(variant))
  );
}

server.tool(
  "list_categories",
  "List every Cremona visual category with its block names.",
  {},
  async () => text(store.categorySummary()),
);

server.tool(
  "list_blocks",
  "List blocks, optionally filtered by category slug or kind (block|layout|component). Returns key, name, description, variant labels.",
  {
    category: z.string().optional().describe("category slug (e.g. 'metrics', 'sections')"),
    kind: z.enum(["block", "layout", "component"]).optional(),
    limit: z.number().optional(),
  },
  async ({ category, kind, limit }) => {
    const known = store.catalog();
    if (
      category &&
      !known.some((g) => g.slug === category || g.category.toLowerCase() === category.toLowerCase())
    )
      return fail(`unknown category '${category}'`, { categories: known.map((g) => g.slug) });
    const items = store
      .blockIndex()
      .filter(
        (b) =>
          !category ||
          b.categorySlug === category ||
          b.category.toLowerCase() === category.toLowerCase(),
      )
      .filter((b) => !kind || b.kind === kind)
      .slice(0, limit ?? 200);
    return text(items);
  },
);

server.tool(
  "search_blocks",
  "Full-text search across block names, descriptions and variant labels.",
  { query: z.string(), limit: z.number().optional() },
  async ({ query, limit }) => text(store.searchBlocks(query, { limit: limit ?? 20 })),
);

server.tool(
  "get_block",
  "Get everything about a visual block: metadata, exact variant props, React source, Stimulus template and golden references. The React source is a PREVIEW COMPOSITION (aria-hidden root, preview frame, content-only props) — derive it, do not drop it into an app as-is; the response carries the recipe.",
  {
    key: z.string().describe("block key as '<category>/<file>', e.g. 'metrics/stat-card'"),
    variant: z.string().optional().describe("variant label to scope props/template/golden to"),
    include: z
      .array(z.enum(["meta", "props", "react", "stimulus", "golden"]))
      .optional()
      .describe("sections to include (default all except golden)"),
  },
  async ({ key, variant, include }) => {
    const parts = parseKey(key);
    if (!parts) return fail("key must be '<category>/<file>', e.g. 'metrics/stat-card'");
    const [categorySlug, file] = parts;
    const meta = store.blockMeta(categorySlug, file);
    if (!meta) return fail(`unknown block: ${key}`, { hint: "list_blocks or search_blocks" });
    const picked = variant === undefined ? undefined : findVariant(meta, variant);
    if (variant !== undefined && !picked)
      return fail(`unknown variant '${variant}' for ${key}`, {
        variants: meta.variants.map((v) => v.label),
      });
    const wanted = new Set(include ?? ["meta", "props", "react", "stimulus"]);
    const out = { key };
    if (wanted.has("meta")) {
      out.meta = {
        name: meta.name,
        description: meta.description,
        kind: meta.kind,
        sourcePath: meta.sourcePath,
        added: meta.added,
        page: meta.page,
        variants: meta.variants.map((v) => ({
          label: v.label,
          slug: v.slug,
          size: v.size ?? "md",
        })),
      };
    }
    if (wanted.has("props")) {
      const all = store.blockPreviewProps(categorySlug, file) ?? {};
      out.props = picked ? { [picked.label]: all[picked.label] ?? {} } : all;
      out.propsNote =
        'Values like "lucide:Users" are icon components: in React import the icon from lucide-react. { "$element": "lucide:Users", "props": {…} } is an element: pass <Users {...props} />. In Stimulus templates both are already rendered.';
    }
    if (wanted.has("react")) {
      out.reactSource = store.blockReactSource(categorySlug, file);
      // Travels with the source: a session that copies `reactSource` gets the
      // caveat in the same payload, not in a guide it will not open.
      out.reactSourceNote = {
        kind: "preview composition",
        why: 'Root is aria-hidden="true" and wrapped in the gallery preview frame (relative isolate flex size-full … px-2); props are content only — no handlers, no children, no ref.',
        asIs: "Illustration only: size the box, pass real data instead of the demo defaults, and add a text equivalent next to it.",
        derive: [
          "remove the preview frame wrapper and its aria-hidden",
          "remove the useInView plumbing (inViewOnce / inViewRepeat / state)",
          "add children, handlers, forwarded ref, ARIA and keyboard",
          "keep the class strings and the motion variants untouched",
        ],
        guide: 'get_guide("react")',
      };
    }
    if (wanted.has("stimulus")) {
      const variants = store.stimulusTemplates(categorySlug, file);
      out.stimulus = {
        templates: variants.map((v) => ({ label: v.label, slug: v.slug })),
        sample: store.stimulusTemplate(
          categorySlug,
          file,
          (picked && variants.find((v) => v.label === picked.label)?.slug) ?? variants[0]?.slug,
        ),
        manifestNote:
          'All templates live in @cremona/stimulus/templates/<category>/<file>/<slug>.html (data-controller="cremona-visual").',
      };
    }
    if (wanted.has("golden")) {
      out.goldenSlugs = store.blockGoldenSlugs(categorySlug, file);
      if (picked) out.golden = store.goldenContent(categorySlug, file, picked.slug);
    }
    return text(out);
  },
);

server.tool(
  "get_golden",
  "Get the SSR golden HTML of one variant (the render reference).",
  { key: z.string(), variant: z.string() },
  async ({ key, variant }) => {
    const parts = parseKey(key);
    const meta = parts && store.blockMeta(parts[0], parts[1]);
    if (!meta) return fail(`unknown block: ${key}`, { hint: "list_blocks or search_blocks" });
    const v = findVariant(meta, variant);
    if (!v)
      return fail(`unknown variant '${variant}' for ${key}`, {
        variants: meta.variants.map((x) => x.label),
      });
    return text(store.goldenContent(parts[0], parts[1], v.slug));
  },
);

server.tool(
  "get_themes",
  "List every design-system theme (9) with labels and oklch swatches.",
  {},
  async () => text(store.themes()),
);

server.tool(
  "get_theme",
  "Get the full CSS token block of one theme (light + dark) plus usage notes.",
  {
    theme: z
      .string()
      .optional()
      .describe("theme value, e.g. 'claude-plus'. Omit for all + default light/dark."),
  },
  async ({ theme }) => {
    const css = store.themeCss();
    if (!theme) {
      return text({
        css,
        usage:
          "Ship @cremona/tokens/css/cremona.css (complete) or css/themes.css (tokens only) and toggle .dark / .theme-<name> on <html>.",
        themes: store.themes(),
      });
    }
    const known = store.themes().map((t) => t.value);
    if (!known.includes(theme)) return fail(`unknown theme '${theme}'`, { themes: known });
    const wanted = [`:root{--background`, `.dark{--background`];
    if (theme !== "default")
      wanted.push(`.theme-${theme}:not(.dark){--background`, `.theme-${theme}.dark{--background`);
    const lines = css.split("\n\n").filter((block) => wanted.some((w) => block.startsWith(w)));
    return text({
      theme,
      css: lines.join("\n\n"),
      themes: store.themes().find((t) => t.value === theme) ?? null,
    });
  },
);

server.tool(
  "get_design_system",
  "Design-system overview: token names, fonts, keyframes, preview-frame anatomy and the animation conventions.",
  {},
  async () => {
    const css = store.designSystemCss();
    const tokenNames = [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--popover",
      "--popover-foreground",
      "--primary",
      "--primary-foreground",
      "--secondary",
      "--secondary-foreground",
      "--muted",
      "--muted-foreground",
      "--accent",
      "--accent-foreground",
      "--destructive",
      "--border",
      "--input",
      "--ring",
      "--chart-1",
      "--chart-2",
      "--chart-3",
      "--chart-4",
      "--chart-5",
      "--radius",
      "--sidebar",
      "--sidebar-foreground",
      "--sidebar-primary",
      "--sidebar-primary-foreground",
      "--sidebar-accent",
      "--sidebar-accent-foreground",
      "--sidebar-border",
      "--sidebar-ring",
    ];
    return text({
      tokens: tokenNames,
      darkMode: "class-based (.dark on <html>), default dark = warm 'Claude-like' palette",
      themes: store.themes().map((t) => t.value),
      font: "Inter Variable (--font-sans), weights 100-900",
      keyframes: [
        "tw-shimmer",
        "caret-blink",
        "scroll-fade-reveal-*",
        "enter/exit (tw-animate-css)",
      ],
      previewFrame: {
        frame:
          "group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15",
        stage:
          "flex grow items-center gap-2 h-96 (xs h-48 | sm h-64 | md h-96 | lg h-[28rem] | xl h-[32rem])",
        footer: "bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground",
        grid: "grid grid-cols-1 gap-2 lg:grid-cols-2 (+ xl:grid-cols-3 for 3 cols)",
      },
      cssBytes: css.length,
      cssPath: "@cremona/tokens/css/cremona.css",
    });
  },
);

server.tool(
  "get_css",
  "Get a library stylesheet. kinds: 'full' = @cremona/tokens/css/cremona.css (complete: fonts + tokens + every utility class the blocks use — ship this); 'tokens' = semantic tokens only; 'fonts' = list of font files.",
  { kind: z.enum(["full", "tokens", "fonts"]).optional() },
  async ({ kind = "full" }) => {
    if (kind === "fonts") {
      const dir = join(store.TOKENS_DIR, "css");
      const fonts = [];
      const { readdirSync } = await import("node:fs");
      for (const f of readdirSync(dir)) if (f.endsWith(".woff2")) fonts.push(f);
      return text({
        fonts,
        note: "Copy packages/tokens/css/*.woff2 next to cremona.css, or rely on the @font-face urls (relative).",
      });
    }
    const css = kind === "tokens" ? store.themeCss() : store.designSystemCss();
    return text({
      kind,
      bytes: css.length,
      note:
        kind === "full"
          ? "Ship this file as-is (one <link>), no Tailwind build needed on the host."
          : undefined,
      css,
    });
  },
);

server.tool(
  "get_controller",
  "Get a Stimulus controller source for host apps: 'visual' = entrance animation player, 'theme' = light/dark + 9 themes switcher.",
  { name: z.enum(["visual", "theme"]).optional() },
  async ({ name = "visual" }) => {
    const { readText } = store;
    const file =
      name === "theme"
        ? join(store.REPO_ROOT, "packages", "stimulus", "src", "cremona-theme_controller.js")
        : join(store.REPO_ROOT, "packages", "stimulus", "src", "cremona-visual_controller.js");
    return text({
      name,
      register: 'import { registerCremona } from "@cremona/stimulus"; registerCremona(app);',
      source: readText(file),
    });
  },
);

if (store.IN_REPO) registerAuthoringTools();

server.tool(
  "validate",
  "Validate library coherence: catalog ↔ blocks ↔ goldens ↔ stimulus templates.",
  {},
  async () => text(store.validate()),
);

const guides = Object.keys(store.docs()).sort();
server.tool(
  "get_guide",
  `Read a repo guide (markdown). Names: ${guides.join(", ")}.`,
  { name: z.enum(guides) },
  async ({ name }) => text(store.doc(name)),
);

function registerAuthoringTools() {
  const catalogPath = join(REPO_ROOT, "packages", "blocks", "catalog.json");
  // the catalog is ordered by plain code-unit comparison of category names
  const byName = (a, b) => (a.category < b.category ? -1 : a.category > b.category ? 1 : 0);

  server.tool(
    "add_category",
    "Create a new visual category (folder + catalog entry). Returns the scaffold path.",
    { name: z.string().describe('Human category name, e.g. "Payments"') },
    async ({ name }) => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (!store.SLUG.test(slug))
        return fail(`"${name}" gives no usable slug: use letters or digits`);
      const current = JSON.parse(await readFile(catalogPath, "utf8"));
      if (current.some((g) => g.slug === slug))
        return text({ ok: true, slug, note: "category already exists" });
      await mkdir(join(store.BLOCKS_DIR, slug), { recursive: true });
      current.push({ category: name.trim(), slug, items: [] });
      current.sort(byName);
      await writeFile(catalogPath, JSON.stringify(current, null, 2) + "\n");
      store.invalidateCaches();
      return text({
        ok: true,
        slug,
        path: `packages/blocks/src/${slug}/`,
        next: "Add blocks with the add_block tool, then follow docs/authoring-guide.md.",
      });
    },
  );

  server.tool(
    "add_block",
    "Scaffold a NEW visual block inside an existing category: block.json + react.tsx skeleton + parity test skeleton, then follow docs/authoring-guide.md. Refuses a key that already exists.",
    {
      category: z.string().describe("slug of an existing category (see list_categories)"),
      file: z.string().describe("new block slug, e.g. 'balance-card'"),
      name: z.string(),
      description: z.string(),
      kind: z.enum(["block", "layout", "component"]).optional(),
    },
    async ({ category, file, name, description, kind }) => {
      const current = JSON.parse(await readFile(catalogPath, "utf8"));
      const group = current.find((g) => g.slug === category);
      if (!group)
        return fail(`unknown category '${category}': create it with add_category first`, {
          categories: current.map((g) => g.slug),
        });
      if (!store.SLUG.test(file))
        return fail(`'${file}' is not a block slug (lowercase words joined by hyphens)`);
      const dir = join(store.BLOCKS_DIR, category, file);
      const testName = `${category}-${file}`;
      const testPath = join(REPO_ROOT, "packages", "blocks", "test", `${testName}.parity.test.tsx`);
      if (existsSync(dir) || existsSync(testPath) || group.items.some((i) => i.file === file))
        return fail(`${category}/${file} already exists: add_block only scaffolds new blocks`);

      await mkdir(join(dir, "golden"), { recursive: true });
      const variants = [
        { label: "default", slug: "000-default", size: null, propsRaw: "{}" },
        {
          label: "fadeOut",
          slug: "001-fadeout",
          size: null,
          propsRaw: "{fadeOut:!0}",
        },
        {
          label: "isometric",
          slug: "002-isometric",
          size: null,
          propsRaw: "{isometric:!0}",
        },
        {
          label: "isometric · fadeOut",
          slug: "003-isometric-fadeout",
          size: null,
          propsRaw: "{isometric:!0,fadeOut:!0}",
        },
        {
          label: "default · no gradient",
          slug: "004-default-no-gradient",
          size: null,
          propsRaw: "{gradient:!1}",
        },
        {
          label: "isometric · no gradient",
          slug: "005-isometric-no-gradient",
          size: null,
          propsRaw: "{isometric:!0,gradient:!1}",
        },
      ];
      const meta = {
        category: group.category,
        file,
        name,
        description,
        added: new Date().toISOString().slice(0, 10),
        kind: kind ?? "block",
        sourcePath: `${category}/${file}.tsx`,
        page: { cols: 2, animated: true, trigger: "inViewRepeat" },
        chunks: { page: null, components: [] },
        variants,
      };
      await writeFile(join(dir, "block.json"), JSON.stringify(meta, null, 2) + "\n");
      await writeFile(join(dir, "react.tsx"), reactSkeleton(pascal(file)));
      await writeFile(testPath, testSkeleton(pascal(file), category, file));

      group.items.push({ file, name, description, added: meta.added });
      await writeFile(catalogPath, JSON.stringify(current, null, 2) + "\n");
      store.invalidateCaches();

      return text({
        ok: true,
        files: [
          `packages/blocks/src/${category}/${file}/block.json`,
          `packages/blocks/src/${category}/${file}/react.tsx`,
          `packages/blocks/test/${testName}.parity.test.tsx`,
        ],
        next: [
          "Implement the visual following docs/authoring-guide.md",
          "From packages/blocks: pnpm vitest run test/generate-goldens.test.tsx, then pnpm vitest run test/" +
            testName +
            ".parity.test.tsx",
          "From the repo root: pnpm generate:stimulus && pnpm check",
        ],
      });
    },
  );
}

/** react.tsx skeleton: the metrics/stat-card anatomy (frame, fill, card, glow, veil, entrance). */
function reactSkeleton(Name) {
  return `import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ${Name}Props extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const card = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export function ${Name}({
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ${Name}Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-72",
          "rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs">
          {/* the visual (docs/authoring-guide.md) */}
        </div>
      </motion.div>
    </div>
  );
}
`;
}

function testSkeleton(Name, category, file) {
  return `import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ${Name} } from "../src/${category}/${file}/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/${category}/${file}");

runGoldenParity("${category}/${file}", {
  blockDir,
  Component: ${Name},
});
`;
}

function pascal(s) {
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`cremona MCP server ready (${store.blockIndex().length} blocks)`);
