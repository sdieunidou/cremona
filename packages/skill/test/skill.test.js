/** Skill checks: valid frontmatter, facts derived from the library, documented install. */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "..", "..");
const skill = readFileSync(join(root, "SKILL.md"), "utf8");
const read = (path) => readFileSync(join(repo, path), "utf8");
const catalog = JSON.parse(read("packages/blocks/catalog.json"));
const themes = JSON.parse(read("packages/tokens/themes.json"));

describe("cremona skill", () => {
  it("has frontmatter a skill loader accepts", () => {
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? "";
    expect(frontmatter).toMatch(/^name: cremona$/m);
    const description = /^description: (.+)$/m.exec(frontmatter)?.[1] ?? "";
    expect(description.length).toBeGreaterThan(0);
    expect(description.length).toBeLessThanOrEqual(1024);
  });

  it("references every tool the MCP server registers", () => {
    const server = read("packages/mcp/src/index.js");
    const tools = [...server.matchAll(/^\s*tool\(\s*"([a-z_]+)"/gm)].map((m) => m[1]);
    expect(tools.length).toBeGreaterThanOrEqual(14);
    for (const tool of tools) expect(skill, tool).toContain(tool);
  });

  it("states the library's current counts", () => {
    const blocks = catalog.reduce((n, g) => n + g.items.length, 0);
    expect(skill).toContain(`${blocks} animated`);
    expect(skill).toContain(`${catalog.length} categories`);
    expect(skill).toContain(`${themes.length} themes`);
    for (const theme of themes) expect(skill).toContain(`\`${theme.value}\``);
  });

  it("names every scale and only categories that exist", () => {
    for (const scale of ["illustration", "real-size", "miniature"])
      expect(skill).toContain(`**${scale}**`);
    const slugs = new Set(catalog.map((g) => g.slug));
    for (const [, slug] of skill.matchAll(/`([a-z]+)\/\*`/g)) expect(slugs, slug).toContain(slug);
  });

  it("warns that blocks are preview compositions", () => {
    expect(skill).toContain("preview compositions, not production components");
    expect(skill).toContain('aria-hidden="true"');
    // the derivation recipe, not just the caveat
    expect(skill).toMatch(/remove the preview frame wrapper/);
    expect(skill).toMatch(/keep\*\* the class strings and the/);
  });

  it("documents both adapters, the public import path and the authoring workflow", () => {
    expect(skill).toContain("@cremona/stimulus");
    expect(skill).toContain('from "@cremona/blocks/metrics/stat-card"');
    expect(skill).toContain("npm i @cremona/blocks @cremona/tokens");
    expect(skill).toContain("docs/porting-guide.md");
    expect(skill).toContain("cremona-visual");
    expect(skill).not.toMatch(/pixel-exact|byte-identical/);
  });

  it("points only at repo paths that exist", () => {
    const paths = [...skill.matchAll(/`((?:packages|docs|tools)\/[^`\s<>*]+)`/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(5);
    for (const path of paths) expect(existsSync(join(repo, path)), path).toBe(true);
  });

  it("is installable as documented in docs/mcp.md", () => {
    const docs = read("docs/mcp.md");
    expect(docs).toContain("packages/skill/SKILL.md");
    expect(docs).toContain("~/.claude/skills/cremona/SKILL.md");
    expect(docs).toContain(".claude/skills/cremona/SKILL.md");
  });
});
