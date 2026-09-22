/** Skill install + content checks. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skill = readFileSync(join(root, "SKILL.md"), "utf8");

describe("cremona skill", () => {
  it("has frontmatter with name + description", () => {
    expect(skill).toMatch(/^---\nname: cremona\n/);
    expect(skill).toContain("description:");
  });

  it("references every MCP tool", () => {
    for (const tool of [
      "list_categories",
      "list_blocks",
      "search_blocks",
      "get_block",
      "get_golden",
      "get_themes",
      "get_theme",
      "get_design_system",
      "add_block",
      "add_category",
      "validate",
      "get_guide",
    ]) {
      expect(skill).toContain(tool);
    }
  });

  it("warns that blocks are preview compositions", () => {
    expect(skill).toContain("preview compositions, not production components");
    expect(skill).toContain('aria-hidden="true"');
    // the derivation recipe, not just the caveat
    expect(skill).toMatch(/remove the preview frame wrapper/);
    expect(skill).toMatch(/keep\*\* the class strings and the/);
  });

  it("documents both adapters + authoring workflow", () => {
    expect(skill).toContain("@cremona/stimulus");
    expect(skill).toContain("@cremona/blocks");
    expect(skill).toContain("docs/porting-guide.md");
    expect(skill).toContain("cremona-visual");
  });

  it("mentions the 9 themes", () => {
    expect(skill).toContain("brutalism");
    expect(skill).toContain("claude-plus");
  });
});
