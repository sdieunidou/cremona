import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
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
  it("lists 37 categories", async () => {
    const cats = textOf(await client.callTool({ name: "list_categories", arguments: {} }));
    expect(cats).toHaveLength(37);
    const metrics = cats.find((c) => c.category === "Metrics");
    expect(metrics.blocks).toBe(3);
    const components = cats.find((c) => c.category === "Components");
    expect(components.blocks).toBe(22);
  });

  it("lists blocks with variants", async () => {
    const blocks = textOf(await client.callTool({ name: "list_blocks", arguments: { category: "metrics" } }));
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

  it("returns a block with react source + stimulus sample + props", async () => {
    const block = textOf(
      await client.callTool({ name: "get_block", arguments: { key: "metrics/stat-card" } }),
    );
    expect(block.meta.name).toBe("Stat Card");
    expect(block.reactSource).toContain("export function StatCard");
    expect(block.stimulus.templates.length).toBeGreaterThan(0);
    expect(block.stimulus.sample).toContain('data-controller="cremona-visual"');
    expect(block.props["default"]).toEqual({});
    expect(block.props["isometric"]).toEqual({ isometric: true });
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
    const theme = textOf(await client.callTool({ name: "get_theme", arguments: { theme: "claude-plus" } }));
    expect(theme.css).toContain(".theme-claude-plus:not(.dark)");
    expect(theme.css).toContain(".theme-claude-plus.dark");
  });

  it("returns the design system overview", async () => {
    const ds = textOf(await client.callTool({ name: "get_design_system", arguments: {} }));
    expect(ds.tokens).toContain("--chart-1");
    expect(ds.themes).toHaveLength(9);
  });

  it("validates coherence", async () => {
    const v = textOf(await client.callTool({ name: "validate", arguments: {} }));
    expect(v.ok).toBe(true);
    expect(v.ported).toBe(v.blocks);
  });

  it("serves guides", async () => {
    const guide = await client.callTool({ name: "get_guide", arguments: { name: "porting-guide" } });
    expect(guide.content[0].text).toContain("# Porting Guide");
  });
});
