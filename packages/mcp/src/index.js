/** Cremona MCP server — exposes the visual library + design system to AI sessions. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as store from "./store.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./store.js";

const server = new McpServer({
  name: "cremona",
  version: "0.1.0",
});

const text = (data) => ({ content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] });

server.tool(
  "list_categories",
  "List every Cremona visual category with its block names.",
  {},
  async () => text(store.categorySummary()),
);

server.tool(
  "list_blocks",
  "List blocks, optionally filtered by category slug or kind (block|layout). Returns key, name, description, variant labels.",
  {
    category: z.string().optional().describe("category slug (e.g. 'metrics', 'sections')"),
    kind: z.enum(["block", "layout"]).optional(),
    limit: z.number().optional(),
  },
  async ({ category, kind, limit }) => {
    const items = store
      .blockIndex()
      .filter((b) => !category || b.categorySlug === category || b.category.toLowerCase() === category.toLowerCase())
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
  "Get everything about a visual block: metadata, exact variant props, React source, Stimulus template and golden references.",
  {
    key: z.string().describe("block key as '<category>/<file>', e.g. 'metrics/stat-card'"),
    variant: z.string().optional().describe("variant label to scope props/template/golden to"),
    include: z
      .array(z.enum(["meta", "props", "react", "stimulus", "golden"]))
      .optional()
      .describe("sections to include (default all except golden)"),
  },
  async ({ key, variant, include }) => {
    const [categorySlug, file] = key.split("/");
    if (!categorySlug || !file) return text({ error: "key must be '<category>/<file>'" });
    const meta = store.blockMeta(categorySlug, file);
    if (!meta) return text({ error: `unknown block: ${key}` });
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
        variants: meta.variants.map((v) => ({ label: v.label, slug: v.slug, size: v.size ?? "md" })),
      };
    }
    if (wanted.has("props")) {
      const all = store.blockPreviewProps(categorySlug, file) ?? {};
      out.props = variant ? { [variant]: all[variant] ?? {} } : all;
      out.propsNote =
        'Values like "lucide:Users" are icon components: in React import the icon from lucide-react; in Stimulus templates they are already rendered.';
    }
    if (wanted.has("react")) {
      out.reactSource = store.blockReactSource(categorySlug, file);
    }
    if (wanted.has("stimulus")) {
      const variants = store.stimulusTemplates(categorySlug, file);
      out.stimulus = {
        templates: variants.map((v) => ({ label: v.label, slug: v.slug })),
        sample: store.stimulusTemplate(categorySlug, file, variant ? variants.find((v) => v.label === variant)?.slug ?? variants[0]?.slug : variants[0]?.slug),
        manifestNote:
          "All templates live in @cremona/stimulus/templates/<category>/<file>/<slug>.html (data-controller=\"cremona-visual\").",
      };
    }
    if (wanted.has("golden")) {
      out.goldenSlugs = store.blockGoldenSlugs(categorySlug, file);
      if (variant) {
        const v = meta.variants.find((x) => x.label === variant);
        if (v) out.golden = store.goldenContent(categorySlug, file, v.slug);
      }
    }
    return text(out);
  },
);

server.tool(
  "get_golden",
  "Get the SSR golden HTML of one variant (the render reference).",
  { key: z.string(), variant: z.string() },
  async ({ key, variant }) => {
    const [categorySlug, file] = key.split("/");
    const meta = store.blockMeta(categorySlug, file);
    const v = meta?.variants.find((x) => x.label === variant);
    if (!meta || !v) return text({ error: "unknown block or variant" });
    return text(store.goldenContent(categorySlug, file, v.slug));
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
  { theme: z.string().optional().describe("theme value, e.g. 'claude-plus'. Omit for all + default light/dark.") },
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
    const wanted = [`:root{--background`, `.dark{--background`];
    if (theme !== "default") wanted.push(`.theme-${theme}:not(.dark){--background`, `.theme-${theme}.dark{--background`);
    const lines = css
      .split("\n\n")
      .filter((block) => wanted.some((w) => block.startsWith(w)));
    return text({ theme, css: lines.join("\n\n"), themes: store.themes().find((t) => t.value === theme) ?? null });
  },
);

server.tool(
  "get_design_system",
  "Design-system overview: token names, fonts, keyframes, preview-frame anatomy and the animation conventions.",
  {},
  async () => {
    const css = store.designSystemCss();
    const tokenNames = [
      "--background", "--foreground", "--card", "--card-foreground", "--popover", "--popover-foreground",
      "--primary", "--primary-foreground", "--secondary", "--secondary-foreground", "--muted",
      "--muted-foreground", "--accent", "--accent-foreground", "--destructive", "--border", "--input",
      "--ring", "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--radius",
      "--sidebar", "--sidebar-foreground", "--sidebar-primary", "--sidebar-primary-foreground",
      "--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-border", "--sidebar-ring",
    ];
    return text({
      tokens: tokenNames,
      darkMode: "class-based (.dark on <html>), default dark = warm 'Claude-like' palette",
      themes: store.themes().map((t) => t.value),
      font: "Inter Variable (--font-sans), weights 100-900",
      keyframes: ["tw-shimmer", "caret-blink", "scroll-fade-reveal-*", "enter/exit (tw-animate-css)"],
      previewFrame: {
        frame: "group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15",
        stage: "flex grow items-center gap-2 h-96 (xs h-48 | sm h-64 | md h-96 | lg h-[28rem] | xl h-[32rem])",
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
      return text({ fonts, note: "Copy packages/tokens/css/*.woff2 next to cremona.css, or rely on the @font-face urls (relative)." });
    }
    const css = kind === "tokens" ? store.themeCss() : store.designSystemCss();
    return text({ kind, bytes: css.length, note: kind === "full" ? "Ship this file as-is (one <link>), no Tailwind build needed on the host." : undefined, css });
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

server.tool(
  "add_category",
  "Create a new visual category (folder + catalog entry). Returns the scaffold path.",
  { name: z.string().describe('Human category name, e.g. "Payments"') },
  async ({ name }) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const dir = join(store.BLOCKS_DIR, slug);
    await mkdir(dir, { recursive: true });
    const catalogPath = join(REPO_ROOT, "packages", "blocks", "catalog.json");
    const current = JSON.parse(await readFile(catalogPath, "utf8"));
    if (current.some((g) => g.slug === slug)) return text({ ok: true, slug, note: "category already exists" });
    current.push({ category: name, slug, items: [] });
    current.sort((a, b) => a.category.localeCompare(b.category));
    await writeFile(catalogPath, JSON.stringify(current, null, 2) + "\n");
    return text({
      ok: true,
      slug,
      path: `packages/blocks/src/${slug}/`,
      next: "Add blocks with the add_block tool, then run node tools/generate-stimulus.mjs and the blocks test suite.",
    });
  },
);

server.tool(
  "add_block",
  "Scaffold a new visual block inside an existing category: block.json + react.tsx skeleton + parity test skeleton. Follow with the porting guide.",
  {
    category: z.string(),
    file: z.string().describe("slug, e.g. 'stat-card'"),
    name: z.string(),
    description: z.string(),
    kind: z.enum(["block", "layout"]).optional(),
  },
  async ({ category, file, name, description, kind }) => {
    const slug = category.toLowerCase();
    const dir = join(store.BLOCKS_DIR, slug, file);
    await mkdir(join(dir, "golden"), { recursive: true });
    const variants = [
      { label: "default", slug: "000-default", size: null, propsRaw: "{}" },
      { label: "fadeOut", slug: "001-fadeout", size: null, propsRaw: "{fadeOut:!0}" },
      { label: "isometric", slug: "002-isometric", size: null, propsRaw: "{isometric:!0}" },
      { label: "isometric · fadeOut", slug: "003-isometric-fadeout", size: null, propsRaw: "{isometric:!0,fadeOut:!0}" },
      { label: "default · no gradient", slug: "004-default-no-gradient", size: null, propsRaw: "{gradient:!1}" },
      { label: "isometric · no gradient", slug: "005-isometric-no-gradient", size: null, propsRaw: "{isometric:!0,gradient:!1}" },
    ];
    const meta = {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      file,
      name,
      description,
      added: new Date().toISOString().slice(0, 10),
      kind: kind ?? "block",
      sourcePath: `${slug}/${file}.tsx`,
      page: { cols: 2, animated: true, trigger: "inViewRepeat" },
      chunks: { page: null, components: [] },
      variants,
    };
    await writeFile(join(dir, "block.json"), JSON.stringify(meta, null, 2) + "\n");

    const reactSkeleton = `import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface ${pascal(file)}Props extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function ${pascal(file)}({
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: ${pascal(file)}Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? { initial: "hidden", animate: trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce) ? "visible" : "hidden" }
    : {};

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}>
      <motion.div
        className={cn("relative w-full max-w-72 rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? undefined : undefined}
        {...state}
      >
        {/* TODO: implement the visual (see docs/porting-guide.md) */}
      </motion.div>
    </div>
  );
}
`;
    await writeFile(join(dir, "react.tsx"), reactSkeleton);

    const testSkeleton = `import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ${pascal(file)} } from "../src/${slug}/${file}/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/${slug}/${file}");

runGoldenParity("${slug}/${file}", {
  blockDir,
  Component: ${pascal(file)},
});
`;
    const testName = `${slug}-${file}`.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    await writeFile(join(REPO_ROOT, "packages", "blocks", "test", `${testName}.parity.test.tsx`), testSkeleton);

    const catalogPath = join(REPO_ROOT, "packages", "blocks", "catalog.json");
    const current = JSON.parse(await readFile(catalogPath, "utf8"));
    const group = current.find((g) => g.slug === slug);
    if (group && !group.items.some((i) => i.file === file)) {
      group.items.push({ file, name, description, added: meta.added });
      await writeFile(catalogPath, JSON.stringify(current, null, 2) + "\n");
    }

    return text({
      ok: true,
      files: [
        `packages/blocks/src/${slug}/${file}/block.json`,
        `packages/blocks/src/${slug}/${file}/react.tsx`,
        `packages/blocks/test/${testName}.parity.test.tsx`,
      ],
      next: [
        "Implement the visual following docs/porting-guide.md",
        "pnpm vitest run test/" + testName + ".parity.test.tsx (from packages/blocks)",
        "node tools/generate-stimulus.mjs",
      ],
    });
  },
);

server.tool("validate", "Validate library coherence: catalog ↔ blocks ↔ goldens ↔ stimulus templates.", {}, async () => text(store.validate()));

server.tool(
  "get_guide",
  "Read a repo guide (markdown). Names: porting-guide, architecture, design-system, mcp, react, stimulus, adding-blocks.",
  { name: z.string() },
  async ({ name }) => {
    const md = store.doc(name);
    if (!md) {
      const all = Object.keys(store.docs());
      return text({ error: `unknown guide '${name}'`, available: all });
    }
    return text(md);
  },
);

function pascal(s) {
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`cremona MCP server ready (${store.blockIndex().length} blocks)`);
