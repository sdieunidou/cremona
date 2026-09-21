#!/usr/bin/env python3
"""Regenerate packages/blocks/src/registry-map.ts from the filesystem."""
import re
import json
import os

SRC = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "blocks", "src")
cat = json.load(open(os.path.join(SRC, "..", "catalog.json")))
imports, entries = [], []
used = set()
for c in cat:
    for item in c["items"]:
        slug, f = c["slug"], item["file"]
        path = os.path.join(SRC, slug, f, "react.tsx")
        src = open(path).read()
        names = re.findall(r"export (?:function|const) ([A-Z]\w+)", src)
        if not names:
            raise SystemExit(f"NO COMPONENT EXPORT: {slug}/{f}")
        pascal = "".join(w.capitalize() for w in f.split("-"))
        comp = pascal if pascal in names else names[0]
        base = f'{slug.replace("-", "")}_{f.replace("-", "")}'
        comp_alias, meta_alias = base + "C", base + "M"
        while comp_alias in used:
            comp_alias += "_"
        while meta_alias in used:
            meta_alias += "_"
        used.update({comp_alias, meta_alias})
        imports.append(f'import {{ {comp} as {comp_alias} }} from "./{slug}/{f}/react.js";')
        imports.append(f'import {meta_alias}Raw from "./{slug}/{f}/block.json";')
        entries.append(
            f'  "{slug}/{f}": {{ meta: {meta_alias}Raw as never, Component: {comp_alias} }},'
        )
out = [
    '/** Block registry — maps "category/file" to its React implementation.',
    " *  Generated from the filesystem: python3 tools/extract/gen_registry.py",
    " *  (or edit carefully after adding a block). */",
    *imports,
    "",
    'import type { BlockDefinition } from "./registry.js";',
    "",
    "export const blocks: Record<string, BlockDefinition> = {",
    *entries,
    "};",
    "",
    "export function getBlock(key: string): BlockDefinition | undefined {",
    "  return blocks[key];",
    "}",
    "",
    "export function blockKeys(): string[] {",
    "  return Object.keys(blocks);",
    "}",
]
with open(os.path.join(SRC, "registry-map.ts"), "w") as fh:
    fh.write("\n".join(out) + "\n")
print(f"registry-map: {len(entries)} entries")
