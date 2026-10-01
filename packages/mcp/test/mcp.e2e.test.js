import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, "../../blocks/catalog.json"), "utf8"));
let client;
let transport;

beforeAll(async () => {
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(here, "../bin/cremona-mcp.mjs")],
  });
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
});

function textOf(result) {
  return JSON.parse(result.content[0].text);
}

describe("cremona MCP server", () => {
  it("lists every category of the catalog", async () => {
    const cats = textOf(await client.callTool({ name: "list_categories", arguments: {} }));
    expect(cats.map((c) => c.slug)).toEqual(catalog.map((g) => g.slug));
    const metrics = cats.find((c) => c.category === "Metrics");
    expect(metrics.blocks).toBe(catalog.find((g) => g.slug === "metrics").items.length);
  });

  it("lists blocks with variants", async () => {
    const blocks = textOf(
      await client.callTool({ name: "list_blocks", arguments: { category: "metrics" } }),
    );
    expect(blocks.map((b) => b.file)).toEqual(["comparison", "stat-card", "trend"]);
    const statCard = blocks.find((b) => b.file === "stat-card");
    expect(statCard.ported).toBe(true);
    expect(statCard.variants).toContain("default");
  });

  it("searches blocks", async () => {
    const results = textOf(
      await client.callTool({ name: "search_blocks", arguments: { query: "kanban" } }),
    );
    expect(results[0].key).toBe("tasks/kanban");
  });

  it("finds plurals, synonyms and natural phrasings", async () => {
    const keys = async (query, extra = {}) =>
      textOf(await client.callTool({ name: "search_blocks", arguments: { query, ...extra } })).map(
        (b) => b.key,
      );

    expect((await keys("buttons"))[0]).toBe("components/button");
    expect((await keys("pie chart"))[0]).toBe("charts/donut");
    expect((await keys("404"))[0]).toBe("states/not-found");
    expect(await keys("settings page")).toEqual(
      expect.arrayContaining(["forms/settings-form", "layouts/settings-shell"]),
    );
    const login = await keys("login");
    expect(login[0]).toBe("forms/login");
    expect(login).toEqual(expect.arrayContaining(["sections/auth", "layouts/auth-shell"]));
    expect((await keys("sign in"))[0]).toBe("forms/login");
    // a short term matches whole words only: "ai" is not the "ai" in "email"
    expect(await keys("ai")).not.toContain("email/inbox");
  });

  it("filters a search by category, kind and scale", async () => {
    const search = async (args) =>
      textOf(await client.callTool({ name: "search_blocks", arguments: args }));
    const metrics = await search({ query: "card", category: "metrics" });
    expect(metrics.map((b) => b.key)).toEqual(["metrics/stat-card"]);
    const components = await search({ query: "table", kind: "component" });
    expect(components.map((b) => b.key)).toEqual(["components/table"]);
    const real = await search({ query: "login", scale: "real-size" });
    expect(real.map((b) => b.key)).toEqual(["forms/login"]);

    const unknown = await client.callTool({
      name: "search_blocks",
      arguments: { query: "card", category: "nope" },
    });
    expect(unknown.isError).toBe(true);
    expect(textOf(unknown).categories).toContain("metrics");
  });

  it("searches on every term, not on the raw query", async () => {
    const search = async (query) =>
      textOf(await client.callTool({ name: "search_blocks", arguments: { query } }));

    // "empty state" appears nowhere as a contiguous string, but each term
    // matches states/empty — the block must still be found.
    const spaced = await search("empty state");
    expect(spaced.map((b) => b.key)).toContain("states/empty");

    // Word order must not matter.
    expect((await search("state empty")).map((b) => b.key)).toContain("states/empty");

    // Terms are ANDed: a block matching only one of them is excluded.
    const kanban = await search("kanban checklist");
    expect(kanban).toHaveLength(0);

    // A contiguous match still outranks a scattered one.
    expect((await search("stat card"))[0].key).toBe("metrics/stat-card");
  });

  it("returns a block with meta, props and react source by default", async () => {
    const block = textOf(
      await client.callTool({ name: "get_block", arguments: { key: "metrics/stat-card" } }),
    );
    expect(block.meta.name).toBe("Stat Card");
    expect(block.reactSource).toContain("export function StatCard");
    expect(block.props["default"]).toEqual({});
    expect(block.props["isometric"]).toEqual({ isometric: true });
    expect(block.stimulus).toBeUndefined();
    expect(block.goldenSlugs).toBeUndefined();
  });

  it("returns the props reference read from the source", async () => {
    const block = textOf(
      await client.callTool({ name: "get_block", arguments: { key: "metrics/stat-card" } }),
    );
    expect(block.api.component).toBe("StatCard");
    const label = block.api.props.find((p) => p.name === "label");
    expect(label).toMatchObject({ type: "string", optional: true, default: '"Revenue"' });
    const animated = block.api.props.find((p) => p.name === "animated");
    expect(animated).toMatchObject({ from: "VisualProps", default: "false" });
    expect(block.api.types.map((t) => t.name)).toContain("Trend");
  });

  it("returns the Stimulus templates and goldens on request", async () => {
    const block = textOf(
      await client.callTool({
        name: "get_block",
        arguments: { key: "metrics/stat-card", include: ["stimulus", "golden"] },
      }),
    );
    expect(block.reactSource).toBeUndefined();
    expect(block.stimulus.templates.length).toBeGreaterThan(0);
    expect(block.stimulus.sample).toContain('data-controller="cremona-visual"');
    expect(block.stimulus.effects).toBe("full");
    expect(block.stimulus.reactOnly).toEqual([]);
    expect(block.stimulus.templates[0].size).toBeTruthy();
    expect(block.stimulus.container).toContain("h-96");
    expect(block.goldenSlugs).toContain("000-default.html");
  });

  it("says which Stimulus templates are entrance-only", async () => {
    const block = textOf(
      await client.callTool({
        name: "get_block",
        arguments: { key: "geo/globe", include: ["stimulus"] },
      }),
    );
    expect(block.stimulus.effects).toBe("entrance-only");
    expect(block.stimulus.reactOnly).toContain("canvas");
  });

  it("tells how to install and import a block from its public path", async () => {
    const block = textOf(
      await client.callTool({
        name: "get_block",
        arguments: { key: "files/simple", include: ["meta"] },
      }),
    );
    expect(block.install).toBe(
      "npm i @cremona/blocks @cremona/tokens motion lucide-react react react-dom",
    );
    expect(block.import).toBe('import { SimpleFile } from "@cremona/blocks/files/simple";');
    expect(block.stylesheet).toContain("@cremona/tokens/css/cremona.css");
  });

  it("returns golden html", async () => {
    const golden = await client.callTool({
      name: "get_golden",
      arguments: { key: "metrics/stat-card", variant: "default" },
    });
    const html = golden.content[0].text;
    expect(html).toContain('class="relative isolate flex size-full');
    expect(html).toContain("$48,213");
  });

  it("returns themes and theme css", async () => {
    const themes = textOf(await client.callTool({ name: "get_themes", arguments: {} }));
    expect(themes.map((t) => t.value)).toContain("claude-plus");
    const theme = textOf(
      await client.callTool({ name: "get_theme", arguments: { theme: "claude-plus" } }),
    );
    expect(theme.css).toContain(".theme-claude-plus:not(.dark)");
    expect(theme.css).toContain(".theme-claude-plus.dark");
    expect(theme.css).toContain(".theme-claude-plus .dark");
  });

  it("returns the design system overview", async () => {
    const ds = textOf(await client.callTool({ name: "get_design_system", arguments: {} }));
    expect(ds.tokens).toContain("--chart-1");
    expect(ds.themes).toHaveLength(9);
  });

  it("returns a stylesheet summary by default and the full file on request", async () => {
    const summary = textOf(await client.callTool({ name: "get_css", arguments: {} }));
    expect(summary.kind).toBe("summary");
    expect(summary.path).toBe("@cremona/tokens/css/cremona.css");
    expect(summary.bytes).toBeGreaterThan(100000);
    expect(summary.import.js).toBe('import "@cremona/tokens/css/cremona.css";');
    expect(summary.fonts.files.length).toBeGreaterThan(0);
    expect(summary.css).toBeUndefined();
    const full = textOf(await client.callTool({ name: "get_css", arguments: { kind: "full" } }));
    expect(full.css.length).toBe(summary.bytes);
  });

  it("offers a stylesheet for each kind of host", async () => {
    const summary = textOf(await client.callTool({ name: "get_css", arguments: {} }));
    expect(summary.stylesheets.map((s) => s.path)).toEqual([
      "@cremona/tokens/css/cremona.css",
      "@cremona/tokens/css/tailwind.css",
      "@cremona/tokens/css/cremona.scoped.css",
    ]);
    expect(summary.stylesheets[2].usage).toContain('class="cremona"');
    const tailwind = textOf(
      await client.callTool({ name: "get_css", arguments: { kind: "tailwind" } }),
    );
    expect(tailwind.recipe).toContain('@import "@cremona/tokens/css/tailwind.css";');
    expect(tailwind.css).toContain("@custom-variant dark");
  });

  it("registers every tool with a title and annotations", async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBe(14);
    for (const tool of tools) {
      expect(tool.title, tool.name).toBeTruthy();
      const writes = tool.name.startsWith("add_");
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(!writes);
      if (writes) expect(tool.annotations?.destructiveHint, tool.name).toBe(true);
    }
  });

  it("validates coherence", async () => {
    const v = textOf(await client.callTool({ name: "validate", arguments: {} }));
    expect(v.ok).toBe(true);
    expect(v.ported).toBe(v.blocks);
  });

  it("serves guides", async () => {
    const guide = await client.callTool({
      name: "get_guide",
      arguments: { name: "porting-guide" },
    });
    expect(guide.content[0].text).toContain("# Porting Guide");
  });

  it("tells a connecting session that blocks are preview compositions", () => {
    // `initialize` instructions are the one thing a client puts in the model's
    // context without being asked; the caveat has to be there, not only in a
    // guide the session will never open.
    const instructions = client.getInstructions();
    expect(instructions).toBeTruthy();
    expect(instructions).toContain("PREVIEW COMPOSITIONS, NOT PRODUCTION COMPONENTS");
    expect(instructions).toContain('aria-hidden="true"');
    expect(instructions).toContain('get_guide("react")');
  });

  it("attaches the caveat to the React source itself", async () => {
    const block = textOf(
      await client.callTool({
        name: "get_block",
        arguments: { key: "components/button", include: ["react"] },
      }),
    );
    expect(block.reactSource).toContain("export function Button");
    expect(block.reactSourceNote.kind).toBe("preview composition");
    expect(block.reactSourceNote.derive).toContain(
      'keep the "use client" directive, the class strings and the motion variants untouched',
    );
    expect(block.reactSource.startsWith('"use client";')).toBe(true);
  });

  it("gives every block a scale", async () => {
    const all = textOf(await client.callTool({ name: "list_blocks", arguments: {} }));
    const scale = Object.fromEntries(all.map((b) => [b.key, b.scale]));
    expect(scale["components/button"]).toBe("real-size");
    expect(scale["forms/login"]).toBe("real-size");
    expect(scale["ecommerce/product-card"]).toBe("real-size");
    expect(scale["ecommerce/product-grid"]).toBe("miniature");
    expect(scale["sections/hero"]).toBe("miniature");
    expect(scale["layouts/auth-shell"]).toBe("miniature");
    expect(scale["charts/line"]).toBe("illustration");
    expect(new Set(Object.values(scale))).toEqual(
      new Set(["real-size", "miniature", "illustration"]),
    );

    const miniature = textOf(
      await client.callTool({ name: "list_blocks", arguments: { scale: "miniature" } }),
    );
    expect(miniature.every((b) => b.scale === "miniature")).toBe(true);
    expect(miniature.map((b) => b.key)).toContain("sections/pricing");

    const block = textOf(
      await client.callTool({
        name: "get_block",
        arguments: { key: "sections/pricing", include: ["meta"] },
      }),
    );
    expect(block.meta.scale).toBe("miniature");
    expect(client.getInstructions()).toContain("`scale`");
  });

  it("lists the component kind", async () => {
    const components = textOf(
      await client.callTool({ name: "list_blocks", arguments: { kind: "component" } }),
    );
    const expected = catalog.find((g) => g.slug === "components").items.length;
    expect(components.length).toBe(expected);
    expect(components.every((b) => b.kind === "component")).toBe(true);
  });

  it("finds a variant by label, slug or loosely typed label", async () => {
    for (const variant of [
      "users · custom copy",
      "006-users-custom-copy",
      "Users  ·  Custom Copy",
    ]) {
      const block = textOf(
        await client.callTool({
          name: "get_block",
          arguments: { key: "metrics/stat-card", variant, include: ["props"] },
        }),
      );
      expect(Object.keys(block.props)).toEqual(["users · custom copy"]);
    }
  });

  it("reports unknown input as an error instead of falling back to defaults", async () => {
    const variant = await client.callTool({
      name: "get_block",
      arguments: { key: "metrics/stat-card", variant: "custom copy" },
    });
    expect(variant.isError).toBe(true);
    expect(textOf(variant).variants).toContain("users · custom copy");

    const calls = [
      { name: "get_block", arguments: { key: "../../etc/passwd" } },
      { name: "get_golden", arguments: { key: "metrics/stat-card", variant: "nope" } },
      { name: "get_theme", arguments: { theme: "ocean" } },
      { name: "list_blocks", arguments: { category: "nope" } },
      { name: "get_guide", arguments: { name: "../README" } },
    ];
    for (const call of calls) expect((await client.callTool(call)).isError, call.name).toBe(true);
  });
});
