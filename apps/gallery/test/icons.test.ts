/** The gallery bundles only the lucide icons that preview props name: the map must match them. */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import * as lucide from "lucide-react";
import { ICONS } from "../src/lib/icon-map.js";

const blocks = join(dirname(fileURLToPath(import.meta.url)), "../../../packages/blocks");

function referencedIcons(): Set<string> {
  const files = [join(blocks, "thumbnail-defaults.json")];
  for (const category of readdirSync(join(blocks, "src"), { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const block of readdirSync(join(blocks, "src", category.name))) {
      const props = join(blocks, "src", category.name, block, "preview-props.json");
      if (existsSync(props)) files.push(props);
    }
  }
  const names = new Set<string>();
  for (const file of files)
    for (const m of readFileSync(file, "utf8").matchAll(/"lucide:([A-Za-z0-9]+)"/g))
      names.add(m[1]!);
  return names;
}

describe("icon map", () => {
  const referenced = referencedIcons();

  it("has every icon a preview prop names (add the missing ones to src/lib/icon-map.ts)", () => {
    expect([...referenced].filter((name) => !(name in ICONS))).toEqual([]);
  });

  it("has no icon that no preview prop names (remove them from src/lib/icon-map.ts)", () => {
    expect(Object.keys(ICONS).filter((name) => !referenced.has(name))).toEqual([]);
  });

  it("maps each name to the lucide-react icon of that name", () => {
    for (const [name, icon] of Object.entries(ICONS))
      expect(icon, name).toBe((lucide as Record<string, unknown>)[name]);
  });
});
