/** Cremona MCP server — exposes the visual library + design system to AI sessions. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as store from "./store.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { REPO_ROOT } from "./store.js";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/**
 * Sent back on `initialize`; MCP clients put it in the model's context. This is
 * the one place a session is guaranteed to read — it never calls
 * `get_guide("react")` on its own — so the preview-vs-production warning lives
 * here, not only in the docs.
 */
const library = store.blockIndex();
const components = store.uiComponents();
const INSTRUCTIONS = `Cremona — ${components.length} real UI components (@cremona/ui) and ${library.length} animated visual blocks (${store.catalog().length} categories, ${library.reduce((n, b) => n + b.variants.length, 0)} variants), a design
system (${store.themes().length} themes x light/dark) and authoring tools.

REAL UI COMES FROM @cremona/ui: ${components.map((c) => c.name).join(", ")}. Accessible (names,
keyboard, focus, 24 px targets), responsive, on the Cremona tokens; an app takes them by copying
their source (the shadcn CLI) or from npm. list_components, get_component. A button, a field, an
input, a checkbox, a switch or a dialog is one of them: use it, do not rebuild it from a block (the
blocks of the "components" category only illustrate them).

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
   useInView plumbing, drop the noFocus spreads that keep preview controls out
   of the tab order, add children/handlers/ref/ARIA/keyboard, and KEEP the
   "use client" directive, the class strings and the motion variants.
   Rewriting a block from its class strings silently drops every entrance
   animation in the library.

Each block has a \`scale\`: "real-size" (components, forms, mobile, notices, most
ecommerce: templates to derive real UI from), "miniature" (sections/*, layouts/*,
ecommerce/product-grid and cart-drawer: thumbnail-scale wireframes with 7-10 px
text — illustrations, never a page or a section) or "illustration" (every other
category: animated product artwork).

Call get_guide("react") for the derivation recipe, the props contract and the
gotchas — the \`gradient\` veil hides the bottom 64px of a card, and entrance
chains run one to two seconds (ai/prompt-box finishes at ~1.8s), which
screenshot tests must wait out. Before adding blocks, read
get_guide("authoring-guide") and get_guide("adding-blocks").

Stimulus (Symfony, Rails…): each template is the block's final render, visible
without JavaScript; the cremona-visual controller plays the entrance. A template
fills its container, so give it a height — the variant's \`size\` (xs h-48, sm h-64,
md h-96 by default, lg h-[28rem], xl h-[32rem]). Blocks whose \`effects\` is
"entrance-only" keep their loops and JS effects (canvas, pointer, sequences) in
React only; get_block(include:["stimulus"]) says which.

Stylesheet, loaded once: @cremona/tokens/css/cremona.css (no Tailwind build needed). An app
with its own Tailwind v4 build imports css/tailwind.css inside that build instead; a page whose
CSS must keep working (Bootstrap, a theme) loads css/cremona.scoped.css and puts the blocks inside
a .cremona element. get_css says how.`;

const server = new McpServer({ name: "cremona", version }, { instructions: INSTRUCTIONS });

/** Hints for clients: every tool only reads the library, except the add_* authoring tools. */
const READ_ONLY = { readOnlyHint: true, openWorldHint: false };
const WRITES_LIBRARY = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

/** registerTool with the title repeated in the annotations (older clients read it there). */
function tool(name, { title, annotations = READ_ONLY, ...config }, handler) {
  server.registerTool(
    name,
    { title, inputSchema: {}, ...config, annotations: { title, ...annotations } },
    handler,
  );
}

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

const KINDS = ["block", "layout", "component"];
const limitSchema = (max) => z.number().int().min(1).max(max).optional();
const unknownCategory = (category) =>
  fail(`unknown category '${category}'`, { categories: store.catalog().map((g) => g.slug) });

const REACT_INSTALL = "npm i @cremona/blocks @cremona/tokens motion lucide-react react react-dom";
const STIMULUS_INSTALL = "npm i @cremona/stimulus @cremona/tokens @hotwired/stimulus";
const UI_INSTALL = "npm i @cremona/ui @cremona/tokens lucide-react react react-dom";
const UI_REGISTRY =
  "https://raw.githubusercontent.com/sdieunidou/cremona/main/packages/ui/r/{name}.json";
const STYLESHEET = "@cremona/tokens/css/cremona.css";
const TAILWIND_STYLESHEET = "@cremona/tokens/css/tailwind.css";
const SCOPED_STYLESHEET = "@cremona/tokens/css/cremona.scoped.css";

tool(
  "list_categories",
  {
    title: "List categories",
    description: "List every Cremona visual category with its slug and block names.",
  },
  async () => text(store.categorySummary()),
);

tool(
  "list_blocks",
  {
    title: "List blocks",
    description:
      "List blocks, optionally filtered by category, kind (block|layout|component) or scale (real-size|miniature|illustration). Returns key, name, description, kind, scale and variant labels.",
    inputSchema: {
      category: z
        .string()
        .optional()
        .describe("category slug or name (e.g. 'metrics', 'Sections')"),
      kind: z.enum(KINDS).optional(),
      scale: z.enum(store.SCALES).optional(),
      limit: limitSchema(200),
    },
  },
  async ({ category, kind, scale, limit }) => {
    const group = category ? store.findCategory(category) : null;
    if (category && !group) return unknownCategory(category);
    const items = store
      .blockIndex()
      .filter((b) => !group || b.categorySlug === group.slug)
      .filter((b) => !kind || b.kind === kind)
      .filter((b) => !scale || b.scale === scale)
      .slice(0, limit ?? 200);
    return text(items);
  },
);

tool(
  "search_blocks",
  {
    title: "Search blocks",
    description:
      "Search block names, descriptions and variant labels. Every word must match, in any order; plurals and common synonyms count ('buttons', 'pie chart' → charts/donut, '404' → states/not-found, 'sign in' → forms/login), and filler words like 'page' are ignored. When no block matches every word, the closest ones (at most 10) come back with `partial: true` and the `unmatched` words: an empty result means no block matches any word, so browse with list_categories or list_blocks. Optional category/kind/scale filters.",
    inputSchema: {
      query: z.string().describe("words to look for, e.g. 'settings page' or 'pie chart'"),
      category: z.string().optional().describe("category slug or name"),
      kind: z.enum(KINDS).optional(),
      scale: z.enum(store.SCALES).optional(),
      limit: limitSchema(200),
    },
  },
  async ({ query, category, kind, scale, limit }) => {
    if (category && !store.findCategory(category)) return unknownCategory(category);
    if (!query.trim() && !category && !kind && !scale)
      return fail("empty query: pass words to look for, or use list_blocks");
    return text(store.searchBlocks(query, { category, kind, scale, limit: limit ?? 20 }));
  },
);

tool(
  "get_block",
  {
    title: "Get a block",
    description:
      "Get a visual block: install line, public import, metadata (with scale), its props reference (types, defaults, descriptions), exact variant props and the React source. Add 'stimulus' to include for the Stimulus templates and one sample, 'golden' for the golden references. The React source is a PREVIEW COMPOSITION (aria-hidden root, preview frame, content-only props) — derive it, do not drop it into an app as-is; the response carries the recipe.",
    inputSchema: {
      key: z.string().describe("block key as '<category>/<file>', e.g. 'metrics/stat-card'"),
      variant: z
        .string()
        .optional()
        .describe("variant label (or slug) to scope props/template/golden to"),
      include: z
        .array(z.enum(["meta", "api", "props", "react", "stimulus", "golden"]))
        .optional()
        .describe('sections to include (default ["meta", "api", "props", "react"])'),
    },
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
    const wanted = new Set(include ?? ["meta", "api", "props", "react"]);
    const exportName = store.blockExportName(categorySlug, file);
    const out = {
      key,
      install: REACT_INSTALL,
      import: exportName
        ? `import { ${exportName} } from "${store.blockImportPath(categorySlug, file)}";`
        : null,
      stylesheet: `import "${STYLESHEET}"; // once, in the app entry (a Tailwind v4 or Bootstrap host: get_css)`,
    };
    if (wanted.has("meta")) {
      out.meta = {
        name: meta.name,
        description: meta.description,
        kind: meta.kind,
        scale: store.blockScale(categorySlug, file),
        added: meta.added,
        page: meta.page,
        variants: meta.variants.map((v) => ({
          label: v.label,
          slug: v.slug,
          size: v.size ?? "md",
        })),
      };
    }
    if (wanted.has("api")) {
      // props contract read from the source: type as written, optional, default, JSDoc
      out.api = store.blockApi(categorySlug, file);
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
          "drop the noFocus spreads (tabIndex -1, mousedown preventDefault) so controls take focus",
          "add children, handlers, forwarded ref, ARIA and keyboard",
          'keep the "use client" directive, the class strings and the motion variants untouched',
        ],
        guide: 'get_guide("react")',
      };
    }
    if (wanted.has("stimulus")) {
      const variants = store.stimulusTemplates(categorySlug, file);
      const entry = store.stimulusManifest()[key] ?? {};
      out.stimulus = {
        install: STIMULUS_INSTALL,
        effects: entry.effects ?? null,
        reactOnly: entry.reactOnly ?? [],
        container:
          "A template fills its container: give it the variant's height (size xs h-48, sm h-64, md h-96, lg h-[28rem], xl h-[32rem]).",
        templates: variants.map((v) => ({ label: v.label, slug: v.slug, size: v.size ?? "md" })),
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

tool(
  "get_golden",
  {
    title: "Get a golden reference",
    description:
      "Get the SSR golden HTML of one variant: the render reference, in its hidden initial state (entrance animations start at opacity 0).",
    inputSchema: {
      key: z.string().describe("block key as '<category>/<file>'"),
      variant: z.string().describe("variant label or slug"),
    },
  },
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

tool(
  "get_themes",
  {
    title: "List themes",
    description: `List every design-system theme (${store.themes().length}) with labels and oklch swatches.`,
  },
  async () => text(store.themes()),
);

tool(
  "get_theme",
  {
    title: "Get a theme's CSS",
    description: "Get the full CSS token block of one theme (light + dark) plus usage notes.",
    inputSchema: {
      theme: z
        .string()
        .optional()
        .describe("theme value, e.g. 'claude-plus'. Omit for all + default light/dark."),
    },
  },
  async ({ theme }) => {
    const css = store.themeCss();
    if (!theme) {
      return text({
        css,
        usage:
          "Ship @cremona/tokens/css/cremona.css (complete) or css/themes.css (tokens only) and toggle .dark / .theme-<name> on <html>; .dark on an inner element renders that subtree dark in the page's theme.",
        themes: store.themes(),
      });
    }
    const known = store.themes().map((t) => t.value);
    if (!known.includes(theme)) return fail(`unknown theme '${theme}'`, { themes: known });
    const wanted = [`:root{--background`, `.dark{--background`];
    if (theme !== "default")
      wanted.push(
        `.theme-${theme}:not(.dark){--background`,
        `.theme-${theme}.dark{--background`,
        `.theme-${theme} .dark{--background`,
      );
    const lines = css.split("\n\n").filter((block) => wanted.some((w) => block.startsWith(w)));
    return text({
      theme,
      css: lines.join("\n\n"),
      themes: store.themes().find((t) => t.value === theme) ?? null,
    });
  },
);

tool(
  "get_design_system",
  {
    title: "Design-system overview",
    description:
      "Design-system overview: token names, fonts, keyframes, preview-frame anatomy and the animation conventions.",
  },
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
      "--destructive-foreground",
      "--success",
      "--success-foreground",
      "--warning",
      "--warning-foreground",
      "--info",
      "--info-foreground",
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
      darkMode:
        "class-based (.dark on <html>); the default theme is neutral in light and dark (the warm 'Claude-like' dark is claude-plus)",
      themes: store.themes().map((t) => t.value),
      font: "Inter Variable (--font-sans), weights 100-900",
      keyframes: ["spin", "ping", "pulse", "enter/exit (tw-animate-css, when a block uses them)"],
      previewFrame: {
        frame:
          "group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15",
        stage:
          "flex grow items-center gap-2 h-96 (xs h-48 | sm h-64 | md h-96 | lg h-[28rem] | xl h-[32rem])",
        footer: "bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground",
        grid: "grid grid-cols-1 gap-2 lg:grid-cols-2 (+ xl:grid-cols-3 for 3 cols)",
      },
      cssBytes: css.length,
      cssPath: STYLESHEET,
    });
  },
);

tool(
  "get_css",
  {
    title: "Get the stylesheet",
    description:
      "How to load the library's styles. kind 'summary' (default): the three stylesheets and which host takes which (plain cremona.css; tailwind.css inside a host's Tailwind v4 build; cremona.scoped.css next to Bootstrap or other CSS), with path, size and import snippets. 'tailwind': css/tailwind.css itself (small) and the host recipe. 'full': the whole minified cremona.css (large: prefer reading it from node_modules). 'tokens': css/themes.css only (semantic tokens). 'fonts': the font files.",
    inputSchema: {
      kind: z.enum(["summary", "tailwind", "full", "tokens", "fonts"]).optional(),
    },
  },
  async ({ kind = "summary" }) => {
    const fonts = readdirSync(join(store.TOKENS_DIR, "css")).filter((f) => f.endsWith(".woff2"));
    const fontsNote =
      "The @font-face urls are relative: keep these .woff2 files next to cremona.css (they ship in the same folder of @cremona/tokens).";
    if (kind === "fonts") return text({ fonts, note: fontsNote });
    if (kind === "tokens") {
      const css = store.themeCss();
      return text({ kind, path: "@cremona/tokens/css/themes.css", bytes: css.length, css });
    }
    const tailwindRecipe = [
      '@import "tailwindcss";',
      '@import "@cremona/tokens/css/tailwind.css";',
      '@source "../node_modules/@cremona/blocks/dist";',
    ].join("\n");
    if (kind === "tailwind") {
      const css = store.tokensCss("tailwind.css");
      return text({
        kind,
        path: TAILWIND_STYLESHEET,
        recipe: tailwindRecipe,
        usage:
          "In the app's own Tailwind v4 entry stylesheet (create-next-app: app/globals.css), instead of cremona.css: one Tailwind build compiles the blocks' classes and the app's together, with Cremona's theme. Adjust the @source path to where node_modules sits.",
        bytes: css.length,
        css,
      });
    }
    const css = store.designSystemCss();
    if (kind === "full") return text({ kind, path: STYLESHEET, bytes: css.length, css });
    const scoped = store.tokensCss("cremona.scoped.css");
    return text({
      kind,
      path: STYLESHEET,
      bytes: css.length,
      approxTokens: Math.round(css.length / 4),
      import: { js: `import "${STYLESHEET}";`, css: `@import "${STYLESHEET}";` },
      contains:
        "Inter @font-face rules, the theme tokens (all themes, light + dark), Tailwind's preflight reset and every utility class the blocks use, compiled with Tailwind v4 and minified. A utility that no block uses has no rule in it.",
      usage:
        "For an app with no CSS framework: load it once, at the app root, and toggle .dark / .theme-<name> on <html>. Its reset applies to the whole page. No Tailwind build is needed on the host.",
      stylesheets: [
        {
          host: "no CSS framework (a new Vite or Next.js app without Tailwind)",
          path: STYLESHEET,
          bytes: css.length,
        },
        {
          host: "its own Tailwind CSS v4 build (create-next-app's default)",
          path: TAILWIND_STYLESHEET,
          recipe: tailwindRecipe,
          more: "get_css kind 'tailwind'",
        },
        {
          host: "CSS of its own that must keep working (Bootstrap, a theme, an existing app)",
          path: SCOPED_STYLESHEET,
          bytes: scoped.length,
          usage:
            'Load it instead of cremona.css and put the blocks inside an element with class="cremona": the reset and the utilities apply only there, and its !important utilities in cascade layers win over unlayered page CSS. If the page puts its own CSS in a layer, declare Cremona\'s first: @layer cremona, bootstrap;',
        },
      ],
      fonts: { files: fonts, note: fontsNote },
      tokensOnly: "@cremona/tokens/css/themes.css (get_css kind 'tokens')",
      full: "get_css kind 'full' returns the whole cremona.css",
      guide:
        'get_guide("getting-started") §2 and §9, get_guide("design-system") "Next to other CSS"',
    });
  },
);

tool(
  "list_components",
  {
    title: "List UI components",
    description:
      "List the real UI components of @cremona/ui: accessible, responsive React components on the Cremona tokens, for the controls, fields and dialogs an app is made of (blocks only illustrate). Returns name, description, exports and npm import. Optional query: every word must appear in a component's name, description or category.",
    inputSchema: {
      query: z.string().optional().describe("words to look for, e.g. 'form' or 'modal'"),
    },
  },
  async ({ query }) => {
    const words = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    const items = components
      .filter((c) => {
        const haystack = [c.name, c.title, c.description, ...c.categories].join(" ").toLowerCase();
        return words.every((word) => haystack.includes(word));
      })
      .map(({ name, title, description, categories, exports, import: path }) => ({
        name,
        title,
        description,
        categories,
        exports,
        import: path,
      }));
    return text({
      install: {
        npm: UI_INSTALL,
        shadcn: `npx shadcn@latest registry add @cremona=${UI_REGISTRY}`,
      },
      components: items,
      guide: 'get_guide("ui") — how a project takes them, and the conventions they follow',
    });
  },
);

tool(
  "get_component",
  {
    title: "Get a UI component",
    description:
      "Get one @cremona/ui component: its npm import, the shadcn commands that copy its source into an app, the packages and registry items it needs, and its source as a project receives it (imports of @/lib/utils and @/components/ui/…). Controls inside a Field are labelled, described and marked invalid by it.",
    inputSchema: {
      name: z.string().describe("component name, e.g. 'button' (see list_components)"),
    },
  },
  async ({ name }) => {
    const component = components.find((c) => c.name === name);
    const item = component && store.uiItem(name);
    if (!component || !item)
      return fail(`unknown component: ${name}`, {
        components: components.map((c) => c.name),
        hint: "list_components",
      });
    return text({
      name,
      title: component.title,
      description: component.description,
      exports: component.exports,
      import: `import { ${component.exports.filter((e) => !e.endsWith("Props")).join(", ")} } from "${component.import}";`,
      install: {
        npm: UI_INSTALL,
        shadcn: [
          `npx shadcn@latest registry add @cremona=${UI_REGISTRY}`,
          `npx shadcn@latest add @cremona/${name}`,
        ],
        note: "registry add once per project; add also installs the registry items below and the packages of dependencies",
      },
      dependencies: component.dependencies,
      registryDependencies: component.registryDependencies,
      devDependencies: item.devDependencies ?? [],
      notes: component.docs,
      stylesheet:
        'cremona.css already holds the classes of every component. In a Tailwind v4 build, import @cremona/tokens/css/tailwind.css, add @source for node_modules/@cremona/ui/dist (npm) or let your own src/components/ui be scanned (shadcn), and import tw-animate-css for the dialog\'s animations: get_guide("ui").',
      files: item.files.map((file) => ({
        path: `components/ui/${file.path.split("/").pop()}`,
        content: file.content,
      })),
      guide: 'get_guide("ui")',
    });
  },
);

tool(
  "get_controller",
  {
    title: "Get a Stimulus controller",
    description: `Get a Stimulus controller source for host apps: 'visual' = entrance animation player, 'theme' = light/dark + ${store.themes().length} themes switcher.`,
    inputSchema: { name: z.enum(["visual", "theme"]).optional() },
  },
  async ({ name = "visual" }) => {
    const file =
      name === "theme"
        ? join(store.REPO_ROOT, "packages", "stimulus", "src", "cremona-theme_controller.js")
        : join(store.REPO_ROOT, "packages", "stimulus", "src", "cremona-visual_controller.js");
    return text({
      name,
      install: STIMULUS_INSTALL,
      register: 'import { registerCremona } from "@cremona/stimulus"; registerCremona(app);',
      source: store.readText(file),
    });
  },
);

if (store.IN_REPO) registerAuthoringTools();

tool(
  "validate",
  {
    title: "Validate the library",
    description:
      "Validate library coherence: catalog ↔ blocks (block.json, react.tsx) ↔ goldens ↔ preview props ↔ Stimulus templates (one per variant) ↔ parity tests.",
  },
  async () => text(store.validate()),
);

const guides = Object.keys(store.docs()).sort();
tool(
  "get_guide",
  {
    title: "Read a guide",
    description: `Read a repo guide (markdown). Names: ${guides.join(", ")}.`,
    inputSchema: { name: z.enum(guides) },
  },
  async ({ name }) => text(store.doc(name)),
);

/** What add_block scaffolds: the default variant and the five style variants of a card block, with their props. */
const SCAFFOLD_VARIANTS = [
  { label: "default", slug: "000-default", props: {} },
  { label: "fadeOut", slug: "001-fadeout", props: { fadeOut: true } },
  { label: "isometric", slug: "002-isometric", props: { isometric: true } },
  {
    label: "isometric · fadeOut",
    slug: "003-isometric-fadeout",
    props: { isometric: true, fadeOut: true },
  },
  { label: "default · no gradient", slug: "004-default-no-gradient", props: { gradient: false } },
  {
    label: "isometric · no gradient",
    slug: "005-isometric-no-gradient",
    props: { isometric: true, gradient: false },
  },
];

function registerAuthoringTools() {
  const catalogPath = join(REPO_ROOT, "packages", "blocks", "catalog.json");
  // the catalog is ordered by plain code-unit comparison of category names
  const byName = (a, b) => (a.category < b.category ? -1 : a.category > b.category ? 1 : 0);

  tool(
    "add_category",
    {
      title: "Add a category",
      description:
        "Create a new visual category (folder + catalog entry, catalog.json rewritten). Returns the scaffold path.",
      inputSchema: { name: z.string().describe('Human category name, e.g. "Payments"') },
      annotations: WRITES_LIBRARY,
    },
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

  tool(
    "add_block",
    {
      title: "Scaffold a block",
      description:
        "Scaffold a NEW visual block inside an existing category: block.json + preview-props.json (the default and the five style variants) + react.tsx skeleton + parity test skeleton, and a catalog.json entry; then follow docs/authoring-guide.md. Refuses a key that already exists.",
      inputSchema: {
        category: z.string().describe("slug of an existing category (see list_categories)"),
        file: z.string().describe("new block slug, e.g. 'balance-card'"),
        name: z.string(),
        description: z.string(),
        kind: z.enum(KINDS).optional(),
      },
      annotations: WRITES_LIBRARY,
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
      const meta = {
        category: group.category,
        file,
        name,
        description,
        added: new Date().toISOString().slice(0, 10),
        kind: kind ?? "block",
        page: { cols: 2, animated: true, trigger: "inViewRepeat" },
        variants: SCAFFOLD_VARIANTS.map(({ label, slug }) => ({ label, slug, size: null })),
      };
      const previewProps = Object.fromEntries(SCAFFOLD_VARIANTS.map((v) => [v.label, v.props]));
      await writeFile(join(dir, "block.json"), JSON.stringify(meta, null, 2) + "\n");
      await writeFile(
        join(dir, "preview-props.json"),
        JSON.stringify(previewProps, null, 2) + "\n",
      );
      await writeFile(join(dir, "react.tsx"), reactSkeleton(pascal(file)));
      await writeFile(testPath, testSkeleton(pascal(file), category, file));

      group.items.push({ file, name, description, added: meta.added });
      await writeFile(catalogPath, JSON.stringify(current, null, 2) + "\n");
      store.invalidateCaches();

      return text({
        ok: true,
        files: [
          `packages/blocks/src/${category}/${file}/block.json`,
          `packages/blocks/src/${category}/${file}/preview-props.json`,
          `packages/blocks/src/${category}/${file}/react.tsx`,
          `packages/blocks/test/${testName}.parity.test.tsx`,
        ],
        next: [
          "Implement the visual following docs/authoring-guide.md; keep the variants whose props it takes in block.json and preview-props.json (same labels), add yours",
          "From packages/blocks: pnpm vitest run test/generate-goldens.test.tsx, then pnpm vitest run test/" +
            testName +
            ".parity.test.tsx",
          "From the repo root: pnpm generate:stimulus && pnpm generate:api && pnpm build:css && pnpm check",
        ],
      });
    },
  );
}

/** react.tsx skeleton: the metrics/stat-card anatomy (frame, fill, card, glow, veil, entrance). */
function reactSkeleton(Name) {
  return `"use client";

import { useRef } from "react";
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
