#!/usr/bin/env python3
"""Shared utilities for extracting the Cremona POC snapshot."""
from __future__ import annotations

import html
import json
import os
import re
import unicodedata

POC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "cremona-ui"))
ASSETS = os.path.join(POC, "build", "assets")
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "packages", "blocks"))

# Chunks that belong to the app infrastructure, never to a block itself.
INFRA_CHUNKS = {
    "dist-B05qellE.js", "dist-OlIVvlp4.js", "createLucideIcon-DNQ_VZJU.js",
    "react-D-vKS4tk.js", "use-in-view-DeLgvbDB.js", "app-G2xDVCqe.js",
    "usePopupHandleStore-DqR6DaAR.js", "useBaseUiId-CSXYp6Rb.js",
    "useOpenChangeComplete-BFYZ6yHr.js", "catalog-CmIdH2zo.js",
    "visuals-CjMKzGos.js", "visuals-Bn1gR1QC.js", "themes-UDLb9wgI.js",
    "input-BiRol7Bu.js", "wayfinder-Dp7PqxvV.js", "text-link-Cjp6P_dC.js",
    "preload-helper-CwIXHf_L.js", "AnimatePresence-CKBDwpJJ.js",
    "visual-preview-page-BLni1jeU.js", "visual-snippet-I2OJ6NG4.js",
    "highlight-jsx-BxjoTg3l.js", "copy-CfvKYgGp.js", "copy-button-BhnSaPx1.js",
    "button-DWh2kK3O.js", "seo-BTU0FgOX.js", "RegistryTokenController-BgAd6x7G.js",
    "visual-modules-bqPFOtOw.js", "x-DMQTlwE_.js", "badge-IF6fViyx.js",
    "use-animate-QPnRkkhy.js",
}

JSX_CALL = re.compile(r"\(0,\w+\.jsxs?\)")
LOCAL_IMPORT = re.compile(r'from"\./([\w.-]+\.js)"')


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def asset(name: str) -> str:
    return read(os.path.join(ASSETS, name))


def is_component_chunk(source: str) -> bool:
    """Icon definition chunks have zero jsx calls; real components have some."""
    return JSX_CALL.search(source) is not None


def parse_module_map() -> dict[str, str]:
    """Return { 'category/block': 'component-chunk-name.js' } (the map targets the
    component used by home thumbnails; the *page* chunk is resolved separately)."""
    raw = asset("visual-modules-bqPFOtOw.js")
    mapping: dict[str, str] = {}
    for m in re.finditer(
        r'"\.\./components/cremona/([\w-]+)/([\w-]+)\.tsx":\(\)=>a\(\(\)=>import\(`\./([\w.-]+\.js)`\)',
        raw,
    ):
        category, block, chunk = m.group(1), m.group(2), m.group(3)
        mapping[f"{category}/{block}"] = chunk
    return mapping


def list_asset_chunks() -> set[str]:
    return {f for f in os.listdir(ASSETS) if f.endswith(".js")}


def page_chunk_for(block_file: str, all_chunks: set[str]) -> str | None:
    """The page chunk defines `variations:[...]`. Chunks are named `<block>-<hash>.js`."""
    candidates = [
        c
        for c in all_chunks
        if c.startswith(block_file + "-") and "variations:[" in asset(c)
    ]
    if len(candidates) == 1:
        return candidates[0]
    if len(candidates) > 1:
        # prefer the one that imports a sibling component chunk
        for c in candidates:
            if any(dep != c and dep.startswith(block_file + "-") for dep in LOCAL_IMPORT.findall(asset(c))):
                return c
        return candidates[0]
    return None


def parse_catalog() -> list[dict]:
    raw = asset("visuals-CjMKzGos.js")
    m = re.search(r"JSON\.parse\(`(.*?)`\)", raw, re.S)
    if not m:
        raise SystemExit("catalog JSON not found in visuals chunk")
    return json.loads(m.group(1))


def component_chunks_for(page_chunk: str) -> list[str]:
    """Transitive closure of local, non-infra, non-icon chunks for a page chunk."""
    seen: set[str] = set()
    stack = [page_chunk]
    found: list[str] = []
    while stack:
        name = stack.pop()
        if name in seen or name in INFRA_CHUNKS:
            continue
        if not os.path.isfile(os.path.join(ASSETS, name)):
            continue
        src = asset(name)
        if not is_component_chunk(src):
            continue  # shared icon chunk
        seen.add(name)
        found.append(name)
        for dep in LOCAL_IMPORT.findall(src):
            if dep not in seen and dep not in INFRA_CHUNKS:
                stack.append(dep)
    found.sort()
    return found


# ---------------------------------------------------------------- variations

def _match_brackets(text: str, open_idx: int, open_ch: str, close_ch: str) -> int:
    depth = 0
    i = open_idx
    in_str = None
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
        elif ch in "`\"'":
            in_str = ch
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError(f"unbalanced {open_ch} at {open_idx}")


def _split_top_level(text: str, sep: str = ",") -> list[str]:
    parts: list[str] = []
    depth = 0
    in_str = None
    start = 0
    i = 0
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
        elif ch in "`\"'":
            in_str = ch
        elif ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        elif ch == sep and depth == 0:
            parts.append(text[start:i])
            start = i + 1
        i += 1
    if text[start:].strip():
        parts.append(text[start:])
    return parts


LABEL_RE = re.compile(r"label:\s*(`[^`]*`|\"[^\"]*\"|'[^']*'|null)")
SIZE_RE = re.compile(r"size:\s*`(\w+)`")
PROPS_RE = re.compile(r"props:\s*(\{)")


def parse_variations(page_chunk_src: str) -> list[dict]:
    """Extract [{label, size, props(raw)}] from a page chunk."""
    m = re.search(r"variations:\s*\[", page_chunk_src)
    if not m:
        return []
    start = m.end() - 1
    end = _match_brackets(page_chunk_src, start, "[", "]")
    body = page_chunk_src[start + 1 : end]
    out = []
    # split top-level objects
    depth = 0
    in_str = None
    obj_start = None
    objs: list[str] = []
    for i, ch in enumerate(body):
        if in_str:
            if ch == "\\":
                continue
            if ch == in_str:
                in_str = None
            continue
        if ch in "`\"'":
            in_str = ch
        elif ch == "{":
            if depth == 0:
                obj_start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and obj_start is not None:
                objs.append(body[obj_start : i + 1])
                obj_start = None
    for obj in objs:
        lm = LABEL_RE.search(obj)
        sm = SIZE_RE.search(obj)
        pm = PROPS_RE.search(obj)
        props_raw = ""
        if pm:
            pstart = pm.start(1)
            pend = _match_brackets(obj, pstart, "{", "}")
            props_raw = obj[pstart : pend + 1]
        label = html.unescape(lm.group(1).strip("`\"'")) if lm and lm.group(1) != "null" else ""
        out.append({"label": label, "size": sm.group(1) if sm else None, "props_raw": props_raw})
    return out


def parse_page_config(page_chunk_src: str) -> dict:
    """Extract path/cols/animated/trigger/size defaults from the page chunk."""
    cfg: dict = {}
    m = re.search(r"path:\s*`([\w/-]+\.tsx)`", page_chunk_src)
    if m:
        cfg["sourcePath"] = m.group(1)
    m = re.search(r"cols:\s*(\d)", page_chunk_src)
    cfg["cols"] = int(m.group(1)) if m else 2
    m = re.search(r"animated:\s*(!0|!1|true|false)", page_chunk_src)
    if m:
        cfg["animated"] = m.group(1) in ("!0", "true")
    m = re.search(r"trigger:\s*`(\w+)`", page_chunk_src)
    cfg["trigger"] = m.group(1) if m else "inViewRepeat"
    m = re.search(r"importName:\s*`(\w+)`", page_chunk_src)
    if m:
        cfg["importName"] = m.group(1)
    return cfg


# ---------------------------------------------------------------- golden html

PREVIEW_CLASS = "group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50"
FOOTER_CLASS = "bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground"


def _find_div_end(source: str, open_idx: int) -> int:
    """Given index of a '<div', return index just past its matching '</div>'."""
    i = open_idx
    depth = 0
    tag_re = re.compile(r"<(/?)div\b[^>]*?(/?)>")
    for m in tag_re.finditer(source, open_idx):
        if m.group(1) == "/":
            depth -= 1
            if depth == 0:
                return m.end()
        else:
            depth += 1
    raise ValueError("unbalanced <div>")


def extract_golden_previews(page_html: str) -> list[dict]:
    """Return ordered [{label, html}] for every preview frame in a block page."""
    body_start = page_html.find("<body")
    # cut scripts out so their content can't confuse the div scanner
    clean = re.sub(r"<script\b.*?</script>", "", page_html[body_start:], flags=re.S)
    previews = []
    idx = 0
    while True:
        idx = clean.find('<div class="group/preview', idx)
        if idx == -1:
            break
        end = _find_div_end(clean, idx)
        block_html = clean[idx:end]
        label = ""
        fm = re.search(
            r'<div class="' + re.escape(FOOTER_CLASS) + r'">(.*?)</div>', block_html, re.S
        )
        if fm:
            label = html.unescape(fm.group(1)).strip()
        previews.append({"label": label, "html": block_html})
        idx = end
    return previews


def slugify(label: str, index: int) -> str:
    base = unicodedata.normalize("NFKD", label).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-") or "variant"
    return f"{index:03d}-{slug}"
