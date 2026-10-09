#!/usr/bin/env node
/**
 * `pnpm build:css`: compiles the shipped stylesheets with Tailwind v4.
 *
 * - css/cremona.css from src/cremona.css;
 * - css/cremona.scoped.css from src/cremona.scoped.css, then confined to `.cremona` elements:
 *   - tokens and theme variables on the wrapper (`.cremona`) and on `.dark` elements inside it;
 *   - Tailwind's preflight and the base styles inside it, unlayered so that they win over the
 *     page's element rules;
 *   - the utilities (!important) on the wrapper and its content, in `@layer cremona.utilities`
 *     (a layered !important wins over an unlayered one), except those of the properties blocks
 *     also set inline or animate (LOOSE): normal, unlayered, one class more specific than the
 *     base styles, so inline styles and animations win over them as in cremona.css; colour
 *     utilities (GUARDED) do not apply where the element sets the same property inline;
 *   - `@layer cremona.defaults` after the utilities, the `--tw-*` initial values in every
 *     browser (shadow roots ignore @property), keyframes renamed `cremona-*`.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Features, transform } from "lightningcss";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tailwind = join(root, "node_modules", ".bin", "tailwindcss");
const ISLAND = "cremona";
/** set inline (display: none, transform-origin) or animated (fades) by blocks; no page CSS
 *  sets them on the blocks' classes */
const LOOSE = new Set(["opacity", "display", "transform-origin"]);
/** animated by block scripts through inline styles (a progress bar turning green), while page
 *  CSS has !important utilities of the same names (Bootstrap's bg-primary, text-white): they stay
 *  !important but do not apply where the element sets the property inline */
const GUARDED = {
  "background-color": [["substring", "background-color:"]],
  color: [
    ["prefix", "color:"],
    ["substring", ";color:"],
    ["substring", "; color:"],
  ],
};

/* selectors, as Lightning CSS components */
const cls = (name) => ({ type: "class", name });
const descendant = { type: "combinator", value: "descendant" };
const universal = { type: "universal" };
const where = (...selectors) => ({ type: "pseudo-class", kind: "where", selectors });
/** :where(.x, .x *): an element with class x, or inside one */
const within = (name) => where([cls(name)], [cls(name), descendant, universal]);
const insideIsland = where([cls(ISLAND), descendant, universal]);
/** :is(.cremona, .cremona *): the wrapper and its content, one class of specificity */
const inIsland = { type: "pseudo-class", kind: "is", selectors: within(ISLAND).selectors };
/** :where(:not([style*="<property>:"])): no inline value of the property, no specificity */
const noInline = (property) =>
  where([
    {
      type: "pseudo-class",
      kind: "not",
      selectors: GUARDED[property].map(([operator, value]) => [
        {
          type: "attribute",
          namespace: null,
          name: "style",
          operation: { operator, value, caseSensitivity: "case-sensitive" },
        },
      ]),
    },
  ]);

/** `part` added to the subject compound of `selector`, before its pseudo-element */
function onSubject(selector, part) {
  let start = 0;
  for (let i = 0; i < selector.length; i++) if (selector[i].type === "combinator") start = i + 1;
  let at = selector.findIndex((p, i) => i >= start && p.type === "pseudo-element");
  if (at < 0) at = selector.length;
  return [...selector.slice(0, at), part, ...selector.slice(at)];
}

const single = (selector, test) => selector.length === 1 && test(selector[0]);
const mentionsIsland = (selector) => JSON.stringify(selector).includes(JSON.stringify(cls(ISLAND)));

/**
 * A token selector (`:root`, `.dark`, `.theme-x:not(.dark)`, `.theme-x.dark`, `.theme-x .dark`)
 * → the wrapper, given the theme and mode classes on it or above it, and the `.dark` elements
 * inside it. Every result has the specificity of a class; source order decides, as in themes.css.
 */
function tokenSelectors(selector) {
  // `.theme-x .dark` goes with `.theme-x.dark`, whose results cover it
  if (selector.some((p) => p.type === "combinator")) return [];
  const themes = [];
  let dark = false;
  for (const part of selector) {
    if (part.type === "pseudo-class" && part.kind === "root") continue;
    if (part.type === "class" && part.name === "dark") dark = true;
    else if (part.type === "class" && part.name.startsWith("theme-"))
      themes.push(within(part.name));
    else if (!(
      part.type === "pseudo-class" &&
      part.kind === "not" &&
      JSON.stringify(part.selectors) === JSON.stringify([[cls("dark")]])
    ))
      throw new Error(`unexpected token selector ${JSON.stringify(selector)}`);
  }
  if (!dark) return [[cls(ISLAND), ...themes]];
  return [
    [cls(ISLAND), ...themes, within("dark")],
    [cls("dark"), insideIsland, ...themes],
  ];
}

/** theme variables: on the wrapper, and where the tokens change (the --color-* aliases) */
function themeSelectors(selector) {
  if (isHost(selector)) return [];
  if (single(selector, (p) => p.type === "pseudo-class" && p.kind === "root"))
    return [[cls(ISLAND)]];
  return tokenSelectors(selector);
}

/** base styles: the page root and body become the wrapper; any other rule applies inside it */
const isHost = (selector) =>
  single(selector, (p) => p.type === "pseudo-class" && p.kind === "host");

function baseSelectors(selector) {
  if (mentionsIsland(selector)) return [selector];
  if (isHost(selector)) return [];
  if (
    single(selector, (p) => p.type === "type" && (p.name === "html" || p.name === "body")) ||
    single(selector, (p) => p.type === "pseudo-class" && p.kind === "root")
  )
    return [[cls(ISLAND)]];
  if (single(selector, (p) => p.type === "class" && p.name === "dark"))
    return tokenSelectors(selector);
  return [[cls(ISLAND), descendant, ...selector]];
}

/** top-level chunks of minified CSS (strings, escapes and comments aware) */
function chunks(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "\\") i++;
    else if (c === '"' || c === "'") {
      for (i++; i < css.length && css[i] !== c; i++) if (css[i] === "\\") i++;
    } else if (c === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2) + 2;
      if (depth === 0) {
        out.push(css.slice(i, end));
        start = end;
      }
      i = end - 1;
    } else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      out.push(css.slice(start, i + 1));
      start = i + 1;
    } else if (c === ";" && depth === 0) {
      out.push(css.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (css.slice(start).trim()) throw new Error(`unparsed CSS: ${css.slice(start, start + 80)}`);
  return out.map((c) => c.trim()).filter(Boolean);
}

/** the declarations of a rule body (strings and parentheses aware) */
function declarations(body) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "\\") i++;
    else if (c === '"' || c === "'") {
      for (i++; i < body.length && body[i] !== c; i++) if (body[i] === "\\") i++;
    } else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) {
      out.push(body.slice(start, i));
      start = i + 1;
    }
  }
  out.push(body.slice(start));
  return out.map((d) => d.trim()).filter(Boolean);
}

/** the rules of `css` reduced to the declarations whose property `keep` accepts: all !important
 *  when `important` (the `content: var(--tw-content)` that a `before:` or `after:` variant adds
 *  to its utility is not, in Tailwind's output), else !important removed unless the class asks
 *  for it (Tailwind's `!` modifier) */
function pick(css, keep, important) {
  return chunks(css)
    .map((rule) => {
      const open = rule.indexOf("{");
      const prelude = rule.slice(0, open);
      const body = rule.slice(open + 1, -1);
      if (prelude.startsWith("@")) {
        const inner = pick(body, keep, important);
        return inner && `${prelude}{${inner}}`;
      }
      const kept = declarations(body)
        .filter((d) => keep(d.slice(0, d.indexOf(":")).trim()))
        .map((d) => {
          const marked = /\s*!important$/.test(d);
          if (important) return marked ? d : `${d}!important`;
          return prelude.includes("\\!") || !marked ? d : d.replace(/\s*!important$/, "");
        });
      return kept.length ? `${prelude}{${kept.join(";")}}` : "";
    })
    .join("");
}

/** re-minifies `css` as Tailwind does, mapping selectors and renaming keyframes */
function rewrite(css, selectors, keyframes) {
  const rename = (name) => (keyframes.has(name) ? `${ISLAND}-${name}` : undefined);
  const { code, warnings } = transform({
    filename: "cremona.scoped.css",
    code: Buffer.from(css),
    minify: true,
    drafts: { customMedia: true },
    nonStandard: { deepSelectorCombinator: true },
    include: Features.Nesting | Features.MediaQueries,
    exclude: Features.LogicalProperties | Features.DirSelector | Features.LightDark,
    targets: {
      safari: (16 << 16) | (4 << 8),
      ios_saf: (16 << 16) | (4 << 8),
      firefox: 128 << 16,
      chrome: 111 << 16,
    },
    visitor: {
      Selector: selectors,
      CustomIdent: rename,
      Token: {
        ident(token) {
          const name = rename(token.value);
          if (name) return { type: "token", value: { type: "ident", value: name } };
        },
      },
    },
  });
  if (warnings.length) throw new Error(warnings.map((w) => w.message).join("\n"));
  return code.toString();
}

/** cremona.css confined to `.cremona` elements (see the header) */
function confine(css) {
  const layers = {};
  const tokens = [];
  const rest = [];
  const license = [];
  for (const chunk of chunks(css)) {
    const layer = /^@layer ([\w-]+)\{([\s\S]*)\}$/.exec(chunk);
    if (chunk.startsWith("/*!")) license.push(chunk);
    else if (layer) layers[layer[1]] = layer[2];
    else if (/^@layer [\w-]+(,[\w-]+)*;$/.test(chunk))
      continue; // Tailwind's (empty) layer order
    else if (/^@(keyframes|property|font-face)\b/.test(chunk)) rest.push(chunk);
    else if (chunk.startsWith("@")) throw new Error(`unexpected at-rule: ${chunk.slice(0, 80)}`);
    else tokens.push(chunk);
  }
  const unknown = Object.keys(layers).filter(
    (l) => !["properties", "theme", "base", "components", "utilities", "defaults"].includes(l),
  );
  if (unknown.length || layers.components) throw new Error(`unexpected layers ${unknown}`);

  const keyframes = new Set([...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]));
  const subject = (s) => [onSubject(s, within(ISLAND))];
  // !important base rules ([hidden]) stay layered, before the utilities, as in cremona.css
  const base = { normal: [], important: [] };
  for (const rule of chunks(layers.base ?? "")) {
    const body = declarations(rule.slice(rule.lastIndexOf("{") + 1, -1));
    const important = body.filter((d) => d.endsWith("!important")).length;
    if (important && (important !== body.length || rule.startsWith("@")))
      throw new Error(`mixed !important base rule: ${rule.slice(0, 80)}`);
    base[important ? "important" : "normal"].push(rule);
  }
  const utilities = layers.utilities ?? "";
  const out = {
    // the initial values of the --tw-* properties, which Tailwind gives only to browsers without
    // @property: set them in every browser, so that a shadow root (where @property is ignored)
    // renders as the page does
    properties: rewrite(
      chunks(layers.properties ?? "")
        .map((rule) =>
          rule.startsWith("@supports") ? rule.slice(rule.indexOf("{") + 1, -1) : rule,
        )
        .join(""),
      subject,
      keyframes,
    ),
    theme:
      rewrite(layers.theme ?? "", themeSelectors, keyframes) +
      rewrite(tokens.join(""), tokenSelectors, keyframes),
    base: rewrite(base.important.join(""), baseSelectors, keyframes),
    utilities: [
      rewrite(
        pick(utilities, (p) => !LOOSE.has(p) && !Object.hasOwn(GUARDED, p), true),
        subject,
        keyframes,
      ),
      ...Object.keys(GUARDED).map((property) =>
        rewrite(
          pick(utilities, (p) => p === property, true),
          (s) => [onSubject(onSubject(s, within(ISLAND)), noInline(property))],
          keyframes,
        ),
      ),
    ].join(""),
    // after the utilities: their !important declarations win over these
    defaults: rewrite(layers.defaults ?? "", subject, keyframes),
  };
  return [
    ...license,
    "/*! Cremona: cremona.css confined to .cremona elements (@cremona/tokens) */",
    `@layer ${Object.keys(out)
      .map((l) => `${ISLAND}.${l}`)
      .join(",")};`,
    ...Object.entries(out).map(([l, code]) => `@layer ${ISLAND}.${l}{${code}}`),
    rewrite(base.normal.join(""), baseSelectors, keyframes),
    rewrite(
      pick(utilities, (p) => LOOSE.has(p), false),
      (s) => [onSubject(s, inIsland)],
      keyframes,
    ),
    rewrite(rest.join(""), (s) => s, keyframes),
  ].join("\n");
}

execFileSync(tailwind, ["-i", "src/cremona.css", "-o", "css/cremona.css", "--minify"], {
  cwd: root,
  stdio: "inherit",
});
const compiled = execFileSync(tailwind, ["-i", "src/cremona.scoped.css", "--minify"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
writeFileSync(join(root, "css", "cremona.scoped.css"), `${confine(compiled)}\n`);
console.error("css/cremona.scoped.css written");
