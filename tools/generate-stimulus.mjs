#!/usr/bin/env node
/**
 * Generate Stimulus templates from the extracted golden HTML.
 *
 * For every block and variant:
 *  - extracts the visual root (children of the preview stage),
 *  - adds data-controller="cremona-visual" + per-element data-anim data,
 *  - writes packages/stimulus/templates/<category>/<file>/<slug>.html
 *  - writes packages/stimulus/templates/manifest.json
 *
 * Usage: node tools/generate-stimulus.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKS = join(ROOT, "packages", "blocks", "src");
const OUT = join(ROOT, "packages", "stimulus", "templates");

/** Find the matching close for the <div ...> starting at `open` (index of '<div'). */
function findDivEnd(source, open) {
  const re = /<(\/?)div\b[^>]*?((?:\/)?)>/g;
  re.lastIndex = open;
  let depth = 0;
  let m;
  while ((m = re.exec(source))) {
    if (m[2]) continue;
    if (m[1]) {
      depth -= 1;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth += 1;
    }
  }
  throw new Error("unbalanced div");
}

/** Extract the visual root element(s) from a golden preview frame. */
function goldenVisual(goldenHtml) {
  const stage = goldenHtml.indexOf('<div class="flex grow items-center gap-2');
  if (stage === -1) throw new Error("stage container not found in golden");
  const open = goldenHtml.indexOf("<div", goldenHtml.indexOf(">", stage));
  const end = findDivEnd(goldenHtml, open);
  return goldenHtml.slice(open, end);
}

/**
 * Tag each element of the markup with data-anim data so the cremona-visual
 * controller can replay the entrance animation:
 *  - elements with an initial hidden style (opacity:0 / transforms / scale)
 *    get `data-anim-to` (the target style) and keep the initial style inline.
 * The controller, on entering the viewport, transitions each element to its
 * target with a stagger cascade derived from `data-anim-order`.
 */
function annotate2(html) {
  let order = 0;
  return html.replace(/<(\w+)\b([^>]*)>/g, (match, tag, rawAttrs) => {
    if (rawAttrs.includes("<")) return match; // malformed safety
    const classMatch = /\bclass="([^"]*)"/.exec(rawAttrs);
    const styleMatch = /\bstyle="([^"]*)"/.exec(rawAttrs);
    const cls = classMatch ? classMatch[1] : "";
    const style = styleMatch ? styleMatch[1] : "";
    if (!/opacity:0|scale\(0|scaleX\(0|translate|rotateX\(0/.test(style)) return match;
    const target = {};
    for (const d of style.split(";").map((x) => x.trim()).filter(Boolean)) {
      if (/^opacity:0$/.test(d)) {
        // target opacity comes from the utility class (opacity-60 -> .6) when present
        const om = /(?:^|\s)opacity-(\d+)\b/.exec(cls);
        target.opacity = om ? String(Number(om[1]) / 100) : "1";
      } else if (/^transform:/.test(d)) {
        let v = d.slice(10).trim();
        if (v === "none") continue;
        v = v
          .replace(/translateY\(([-\d.]+)px\)/g, "translateY(0px)")
          .replace(/translate\([^)]*\)/g, "translate(0px,0px)")
          .replace(/scale\(([\d.]+)\)/g, "scale(1)")
          .replace(/scaleX\(([\d.]+)\)/g, "scaleX(1)")
          .replace(/rotateX\(([\d.]+)deg\) rotateZ\(([-\d.]+)deg\)/g, "rotateX(45deg) rotateZ(-45deg)")
          .replace(/rotateX\(0deg\) rotateZ\(0deg\)/g, "rotateX(45deg) rotateZ(-45deg)");
        if (v && v !== "none") target.transform = v;
      }
    }
    const cleanedAttrs = rawAttrs
      .replace(/\s*data-anim-order="[^"]*"/, "")
      .replace(/\s*data-anim-to="[^"]*"/, "")
      .replace(/\s*data-anim-initial="[^"]*"/, "");
    const attrs = [`data-anim-order="${order++}"`];
    attrs.push(`data-anim-initial="${style.replace(/"/g, "&quot;")}"`);
    if (Object.keys(target).length)
      attrs.push(`data-anim-to="${JSON.stringify(target).replace(/"/g, "&quot;")}"`);
    return `<${tag}${cleanedAttrs} ${attrs.join(" ")}>`;
  });
}

/** Add the cremona-visual controller to the visual root element. */
function withController(html) {
  return html.replace(/^<(\w+)\b/, (m, tag) => `<${tag} data-controller="cremona-visual"`);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const manifest = {};
const blockJsons = walk(BLOCKS).filter((p) => p.endsWith("block.json"));
let templates = 0;

for (const bjPath of blockJsons) {
  const meta = JSON.parse(readFileSync(bjPath, "utf8"));
  const dir = dirname(bjPath);
  const goldenDir = join(dir, "golden");
  if (!existsSync(goldenDir)) continue;
  const key = `${meta.category.toLowerCase()}/${meta.file}`;
  manifest[key] = {
    name: meta.name,
    description: meta.description,
    kind: meta.kind,
    category: meta.category.toLowerCase(),
    file: meta.file,
    variants: [],
  };
  for (const variant of meta.variants) {
    const goldenPath = join(goldenDir, `${variant.slug}.html`);
    if (!existsSync(goldenPath)) continue;
    const golden = readFileSync(goldenPath, "utf8");
    try {
      const visual = withController(annotate2(goldenVisual(golden)));
      const outFile = join(OUT, meta.category.toLowerCase(), meta.file, `${variant.slug}.html`);
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, visual + "\n");
      manifest[key].variants.push({ label: variant.label, slug: variant.slug, size: variant.size });
      templates += 1;
    } catch (err) {
      console.error(`WARN ${key}/${variant.slug}: ${err.message}`);
    }
  }
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`stimulus templates: ${templates} variants across ${Object.keys(manifest).length} blocks`);
