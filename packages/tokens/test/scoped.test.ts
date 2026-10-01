/**
 * css/cremona.scoped.css is cremona.css confined to `.cremona` elements, for pages with CSS of
 * their own: every rule targets the wrapper or its content, the utilities are !important in a
 * layer (but those of the properties blocks set inline or animate), and the wrapper gets the
 * tokens the page root gets from cremona.css.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transform, type Selector } from "lightningcss";
import { describe, it, expect } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scoped = readFileSync(join(root, "css", "cremona.scoped.css"), "utf8");
const full = readFileSync(join(root, "css", "cremona.css"), "utf8");

function block(css: string, prelude: string): string {
  const start = css.indexOf(`${prelude}{`);
  expect(start, prelude).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start + prelude.length + 1, i);
  }
  throw new Error(`unclosed ${prelude}`);
}

function selectors(css: string): Selector[] {
  const out: Selector[] = [];
  transform({
    filename: "x.css",
    code: Buffer.from(css),
    visitor: {
      Selector(selector) {
        out.push(selector);
      },
    },
  });
  return out;
}

/** top-level rules of a CSS fragment as [prelude, body] (no nesting) */
function rules(css: string): [string, string][] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1]!.trim(), m[2]!]);
}

/** declarations of the rules that set --background, in order */
function tokenBlocks(css: string): string[] {
  return rules(css)
    .filter(([, body]) => body.startsWith("--background:"))
    .map(([, body]) => body);
}

/** class names in the selectors of a stylesheet */
function classes(css: string): Set<string> {
  const out = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const part = value as { type?: string; name?: string };
      if (part.type === "class" && part.name) out.add(part.name);
      Object.values(value).forEach(walk);
    }
  };
  selectors(css).forEach(walk);
  return out;
}

describe("css/cremona.scoped.css", () => {
  it("applies every rule to .cremona elements only", () => {
    const all = selectors(scoped);
    expect(all.length).toBeGreaterThan(1000);
    const island = JSON.stringify({ type: "class", name: "cremona" });
    const outside = all.filter((s) => !JSON.stringify(s).includes(island));
    expect(outside, "selectors outside .cremona").toEqual([]);
  });

  it("puts its layers in one order, and the utilities, all !important, near the end", () => {
    expect(scoped).toContain(
      "@layer cremona.properties,cremona.theme,cremona.base,cremona.utilities,cremona.defaults;",
    );
    // a page's !important `border` shorthand (Bootstrap) does not recolour the blocks' borders
    expect(block(scoped, "@layer cremona.defaults")).toBe(
      ".border:where(.cremona,.cremona *){border-color:var(--border)!important}",
    );
    let normal = 0;
    let important = 0;
    transform({
      filename: "x.css",
      code: Buffer.from(block(scoped, "@layer cremona.utilities")),
      visitor: {
        Rule: {
          style(rule) {
            normal += rule.value.declarations?.declarations?.length ?? 0;
            important += rule.value.declarations?.importantDeclarations?.length ?? 0;
          },
        },
      },
    });
    expect(important).toBeGreaterThan(2000);
    expect(normal).toBe(0);
  });

  it("keeps the utilities of inline-set and animated properties normal and unlayered", () => {
    const layered = block(scoped, "@layer cremona.utilities");
    expect(layered).not.toMatch(/[{;](opacity|display|transform-origin):/);
    expect(scoped).toContain(".flex:is(.cremona,.cremona *){display:flex}");
    expect(scoped).toContain(".opacity-60:is(.cremona,.cremona *){opacity:.6}");
    expect(scoped).toContain(".origin-top:is(.cremona,.cremona *){transform-origin:top}");
    expect(scoped).not.toMatch(/[{;](opacity|transform-origin):[^;}]*!important/);
    // [hidden] keeps hiding, before the utilities, as in cremona.css
    expect(block(scoped, "@layer cremona.base")).toContain("{display:none!important}");
  });

  it("defines the classes of cremona.css", () => {
    const own = classes(full);
    const confined = classes(scoped);
    expect([...own].filter((c) => !confined.has(c))).toEqual([]);
    expect([...confined].filter((c) => !own.has(c))).toEqual(["cremona"]);
  });

  it("sets on the wrapper, for each theme and mode, the tokens of cremona.css", () => {
    const theme = block(scoped, "@layer cremona.theme");
    // :root, .dark, then light and dark per theme
    expect(tokenBlocks(theme)).toHaveLength(18);
    expect(tokenBlocks(theme)).toEqual(tokenBlocks(full));
    expect(theme).toContain(".cremona{--background:");
    expect(theme).toContain(".cremona:where(.dark,.dark *),.dark:where(.cremona *){--background:");
    expect(theme).toContain(".cremona:where(.theme-sakura,.theme-sakura *){--background:");
    expect(theme).toContain(
      ".cremona:where(.theme-sakura,.theme-sakura *):where(.dark,.dark *),.dark:where(.cremona *):where(.theme-sakura,.theme-sakura *){--background:",
    );
  });

  it("gives the --tw-* properties their initial values without @property (shadow roots)", () => {
    const properties = block(scoped, "@layer cremona.properties");
    expect(properties).not.toContain("@supports");
    expect(properties).toMatch(/^:where\(\.cremona,\.cremona \*\),[^{]*\{--tw-translate-x:0;/);
  });

  it("names its keyframes cremona-*", () => {
    expect(scoped).not.toMatch(/@keyframes (?!cremona-)/);
    for (const m of scoped.matchAll(/(?:animation|--animate-[\w-]+):([^;}]*)/g))
      expect(m[1], m[0]).toMatch(/cremona-|var\(/);
  });
});
