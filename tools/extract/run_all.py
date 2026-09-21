#!/usr/bin/env python3
"""Extract the Cremona POC snapshot into packages/blocks + packages/tokens."""
from __future__ import annotations

import json
import os
import re
import shutil

import lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BLOCKS = os.path.join(ROOT, "packages", "blocks")
TOKENS = os.path.join(ROOT, "packages", "tokens")
CSS_OUT = os.path.join(TOKENS, "css")
FONTS_OUT = os.path.join(TOKENS, "assets", "fonts")

report = {"blocks": 0, "variants": 0, "golden": 0, "issues": []}


def step_catalog_and_blocks() -> None:
    catalog = lib.parse_catalog()
    module_map = lib.parse_module_map()
    all_chunks = lib.list_asset_chunks()

    os.makedirs(os.path.join(BLOCKS, "src"), exist_ok=True)
    total_items = 0
    for group in catalog:
        category = group["category"]
        for item in group["items"]:
            total_items += 1
            key = f"{category.lower()}/{item['file']}"
            component_chunk = module_map.get(key)
            page_chunk = lib.page_chunk_for(item["file"], all_chunks)
            if component_chunk_missing := (
                not component_chunk or not os.path.isfile(os.path.join(lib.ASSETS, component_chunk))
            ):
                report["issues"].append(f"component chunk missing: {key}")
            if not page_chunk:
                report["issues"].append(f"page chunk not found: {key}")
            page_src = lib.asset(page_chunk) if page_chunk else ""
            page_dir = os.path.join(BLOCKS, "src", category.lower(), item["file"])
            os.makedirs(os.path.join(page_dir, "sources"), exist_ok=True)
            os.makedirs(os.path.join(page_dir, "golden"), exist_ok=True)

            cfg = lib.parse_page_config(page_src) if page_src else {}
            variations = lib.parse_variations(page_src) if page_src else []

            # component chunks: from the map + any local non-page siblings referenced by the page
            chunks = []
            if component_chunk_missing is False and component_chunk:
                chunks.append(component_chunk)
            if page_chunk:
                for dep in lib.LOCAL_IMPORT.findall(page_src):
                    if dep in all_chunks and dep not in lib.INFRA_CHUNKS and dep != component_chunk:
                        if dep not in chunks and lib.is_component_chunk(lib.asset(dep)):
                            chunks.append(dep)
            chunks.sort()

            # write sources
            with open(os.path.join(page_dir, "sources", "page.js"), "w") as f:
                f.write(page_src)
            for c in chunks:
                with open(os.path.join(page_dir, "sources", c), "w") as f:
                    f.write(lib.asset(c))

            # golden previews: write every frame found in the SSR page, pair to
            # variations by label (builds may drift slightly; extras are flagged).
            html_path = os.path.join(lib.POC, "visuals", category.lower(), item["file"] + ".html")
            golden = []
            matched: list[dict] = []
            if os.path.isfile(html_path):
                page_html = lib.read(html_path)
                previews = lib.extract_golden_previews(page_html)
                for i, p in enumerate(previews):
                    slug = lib.slugify(p["label"], i)
                    with open(os.path.join(page_dir, "golden", slug + ".html"), "w") as f:
                        f.write(p["html"])
                    props_raw = next(
                        (v["props_raw"] for v in variations if v["label"] == p["label"]), ""
                    )
                    size = next((v.get("size") for v in variations if v["label"] == p["label"]), None)
                    golden.append({
                        "label": p["label"],
                        "slug": slug,
                        "size": size,
                        "propsRaw": props_raw,
                    })
                    report["golden"] += 1
                if len(previews) != len(variations):
                    report["issues"].append(
                        f"{key}: {len(variations)} variations vs {len(previews)} golden previews (paired by label)"
                    )

            block_meta = {
                "category": category,
                "file": item["file"],
                "name": item["name"],
                "description": item["description"],
                "added": item["added"],
                "kind": "layout" if category.lower() == "sections" else "block",
                "sourcePath": cfg.get("sourcePath", f"components/cremona/{category.lower()}/{item['file']}.tsx"),
                "page": {"cols": cfg.get("cols", 2), "animated": cfg.get("animated", True), "trigger": cfg.get("trigger", "inViewRepeat")},
                "chunks": {"page": page_chunk, "components": chunks},
                "variants": golden,
            }
            with open(os.path.join(page_dir, "block.json"), "w") as f:
                json.dump(block_meta, f, indent=2, ensure_ascii=False)
            report["blocks"] += 1
            report["variants"] += len(golden)
    print(f"blocks: {report['blocks']} | variants: {report['variants']}")


def step_themes() -> None:
    os.makedirs(CSS_OUT, exist_ok=True)
    os.makedirs(FONTS_OUT, exist_ok=True)
    css = lib.read(os.path.join(lib.ASSETS, "app-BhQcyYqo.css"))

    blocks_out = []
    # default light + dark
    m = re.search(r":root\{(--background:.*?)\}", css)
    blocks_out.append(("default-light", ":root", m.group(1)))
    m = re.search(r"\.dark\{(--background:.*?)\}", css)
    blocks_out.append(("default-dark", ".dark", m.group(1)))
    # themed
    for name in ["claude-plus", "light-green", "zen", "sakura", "tiesen", "deep-purple", "indigo-clean", "brutalism"]:
        m = re.search(re.escape(f".theme-{name}:not(.dark)") + r"\{(.*?)\}", css)
        if m:
            blocks_out.append((f"theme-{name}-light", f".theme-{name}:not(.dark)", m.group(1)))
        m = re.search(re.escape(f".theme-{name}.dark") + r"\{(.*?)\}", css)
        if m:
            blocks_out.append((f"theme-{name}-dark", f".theme-{name}.dark", m.group(1)))

    lines = [
        "/* Cremona design tokens — extracted from the POC build (source of truth).",
        " * Default light: neutral · Default dark: warm (Claude-like).",
        " * Theme classes: .theme-<name> on <html>, dark via .dark on <html>. */",
        "",
    ]
    for _name, selector, body in blocks_out:
        lines.append(f"{selector}{{{body}}}")
        lines.append("")
    with open(os.path.join(CSS_OUT, "themes.css"), "w") as f:
        f.write("\n".join(lines))

    # theme meta (labels + swatches) from themes chunk
    themes_src = lib.asset("themes-UDLb9wgI.js")
    m = re.search(r"JSON|t=\[(.*?)\]\.map", themes_src)
    meta = re.findall(
        r"\{value:`([\w-]+)`,label:`([^`]+)`,class:(null|`[\w-]+`),swatches:\[([^\]]+)\]\}", themes_src
    )
    meta_out = []
    for value, label, klass, swatches in meta:
        sw = [s.strip("`\"'") for s in re.findall(r"`([^`]+)`|\"([^\"]+)\"", swatches) for s in s if s]
        meta_out.append({
            "value": value,
            "label": label,
            "class": None if klass == "null" else klass.strip("`"),
            "swatches": sw,
        })
    with open(os.path.join(TOKENS, "themes.json"), "w") as f:
        json.dump(meta_out, f, indent=2)

    # fonts
    for f in os.listdir(lib.ASSETS):
        if f.endswith(".woff2"):
            shutil.copy(os.path.join(lib.ASSETS, f), os.path.join(FONTS_OUT, f))
    print(f"themes: {len(blocks_out)} token blocks, {len(meta_out)} theme meta, fonts copied")


def step_media() -> None:
    pub = os.path.join(ROOT, "apps", "gallery", "public")
    os.makedirs(os.path.join(pub, "media"), exist_ok=True)
    shutil.copytree(os.path.join(lib.POC, "media"), os.path.join(pub, "media"), dirs_exist_ok=True)
    for f in ("favicon.svg", "favicon.png"):
        shutil.copy(os.path.join(lib.POC, f), os.path.join(pub, f))
    print("media copied")


def step_catalog_json() -> None:
    """Write the enriched catalog consumed by the MCP server + docs."""
    catalog = lib.parse_catalog()
    out = []
    for group in catalog:
        cat = {"category": group["category"], "slug": group["category"].lower(), "items": []}
        for item in group["items"]:
            block_json = os.path.join(BLOCKS, "src", cat_slug := group["category"].lower(), item["file"], "block.json")
            entry = dict(item)
            entry["categorySlug"] = cat_slug
            if os.path.isfile(block_json):
                meta = json.load(open(block_json))
                entry["kind"] = meta["kind"]
                entry["variants"] = [v["label"] for v in meta["variants"]]
                entry["cols"] = meta["page"]["cols"]
            cat["items"].append(entry)
        out.append(cat)
    with open(os.path.join(BLOCKS, "catalog.json"), "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    n = sum(len(c["items"]) for c in out)
    print(f"catalog.json: {len(out)} categories, {n} blocks")


if __name__ == "__main__":
    step_catalog_and_blocks()
    step_themes()
    step_media()
    step_catalog_json()
    if report["issues"]:
        print("\nISSUES:")
        for i in report["issues"]:
            print(" -", i)
