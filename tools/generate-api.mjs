#!/usr/bin/env node
/**
 * Write packages/blocks/src/<category>/<file>/api.json — the props reference of every block, read
 * from its TypeScript source: each prop's type as written, whether it is optional, its default
 * (the initializer in the component's parameter) and its JSDoc, then the shapes of the block's own
 * types those props use. The gallery shows it on each block page; the MCP server returns it.
 *
 * Usage: node tools/generate-api.mjs           rewrite the files
 *        node tools/generate-api.mjs --check   list stale files and exit 1, write nothing
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as prettier from "prettier";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKS = join(ROOT, "packages", "blocks", "src");
const check = process.argv.includes("--check");

const files = readdirSync(BLOCKS, { withFileTypes: true })
  .filter((category) => category.isDirectory())
  .flatMap((category) =>
    readdirSync(join(BLOCKS, category.name)).map((block) =>
      join(BLOCKS, category.name, block, "react.tsx"),
    ),
  )
  .filter((file) => existsSync(file))
  .sort();

const config = ts.getParsedCommandLineOfConfigFile(
  join(ROOT, "packages", "blocks", "tsconfig.json"),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => fail(d.messageText) },
);
const program = ts.createProgram(files, { ...config.options, noEmit: true });
const checker = program.getTypeChecker();

function fail(message) {
  console.error(`generate-api: ${message}`);
  process.exit(1);
}

/** Source text on one line, long values elided. */
function oneLine(node, max = 80) {
  const text = node.getText().replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** JSDoc text with the source's hard line breaks unwrapped (paragraphs kept). */
function doc(symbol) {
  return ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " "))
    .join("\n\n");
}

function unwrap(expression) {
  let e = expression;
  while (
    ts.isAsExpression(e) ||
    ts.isSatisfiesExpression(e) ||
    ts.isParenthesizedExpression(e) ||
    ts.isTypeAssertionExpression(e)
  )
    e = e.expression;
  return e;
}

/** A default's value, followed through module constants (`copy.title` → "Revenue"). */
function resolveValue(expression, depth = 0) {
  const e = unwrap(expression);
  if (depth > 4) return e;
  if (ts.isIdentifier(e)) {
    const decl = checker.getSymbolAtLocation(e)?.valueDeclaration;
    const constant =
      decl &&
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isVariableDeclarationList(decl.parent) &&
      (decl.parent.flags & ts.NodeFlags.Const) !== 0;
    return constant ? resolveValue(decl.initializer, depth + 1) : e;
  }
  if (ts.isPropertyAccessExpression(e)) {
    const base = resolveValue(e.expression, depth + 1);
    if (ts.isObjectLiteralExpression(base)) {
      const prop = base.properties.find(
        (p) =>
          (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) &&
          p.name.getText() === e.name.text,
      );
      if (prop)
        return resolveValue(
          ts.isPropertyAssignment(prop) ? prop.initializer : prop.name,
          depth + 1,
        );
    }
  }
  return e;
}

function defaultText(initializer) {
  const value = resolveValue(initializer);
  if (ts.isArrayLiteralExpression(value))
    return value.elements.length ? `[…] (${value.elements.length} items)` : "[]";
  if (ts.isObjectLiteralExpression(value)) return value.properties.length ? "{…}" : "{}";
  return oneLine(value, 60);
}

function deprecated(symbol) {
  return symbol.getJsDocTags(checker).some((tag) => tag.name === "deprecated");
}

/** The interfaces and type aliases a type node names that are declared in `source`. */
function localReferences(node, source, out) {
  const visit = (n) => {
    if (ts.isTypeReferenceNode(n)) {
      const symbol = checker.getSymbolAtLocation(n.typeName);
      for (const decl of symbol?.declarations ?? []) {
        if (
          decl.getSourceFile() === source &&
          (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl))
        )
          out.add(decl);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
}

/** A property signature as { name, type, optional, description?, deprecated? }. */
function member(symbol, extra = {}) {
  const decl = symbol.declarations?.[0];
  const typeNode = decl && "type" in decl ? decl.type : undefined;
  const entry = {
    name: symbol.getName(),
    type: typeNode
      ? oneLine(typeNode, 200)
      : checker.typeToString(
          checker.getTypeOfSymbol(symbol),
          undefined,
          ts.TypeFormatFlags.NoTruncation,
        ),
    optional: (symbol.flags & ts.SymbolFlags.Optional) !== 0,
    ...extra,
  };
  const description = doc(symbol);
  if (description) entry.description = description;
  if (deprecated(symbol)) entry.deprecated = true;
  return { entry, typeNode };
}

function describeBlock(file) {
  const source = program.getSourceFile(file);
  if (!source) fail(`cannot read ${file}`);
  const component = source.statements.find(
    (s) =>
      ts.isFunctionDeclaration(s) &&
      s.name &&
      /^[A-Z]/.test(s.name.text) &&
      s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword),
  );
  if (!component) fail(`${relative(ROOT, file)} exports no component function`);
  const param = component.parameters[0];
  if (!param?.type) fail(`${relative(ROOT, file)}: ${component.name.text} has no typed props`);

  const defaults = new Map();
  if (ts.isObjectBindingPattern(param.name)) {
    for (const element of param.name.elements) {
      const key = (element.propertyName ?? element.name).getText();
      if (element.initializer) defaults.set(key, defaultText(element.initializer));
    }
  }

  const referenced = new Set();
  const own = [];
  const inherited = [];
  for (const symbol of checker.getPropertiesOfType(checker.getTypeFromTypeNode(param.type))) {
    const decl = symbol.declarations?.[0];
    const local = decl?.getSourceFile() === source;
    const parent =
      decl && ts.isInterfaceDeclaration(decl.parent) ? decl.parent.name.text : undefined;
    const { entry, typeNode } = member(symbol, local || !parent ? {} : { from: parent });
    if (defaults.has(entry.name)) entry.default = defaults.get(entry.name);
    if (typeNode && local) localReferences(typeNode, source, referenced);
    (local ? own : inherited).push(entry);
  }

  // shapes of the block's own types, including the ones they use in turn
  const types = [];
  const seen = new Set();
  const queue = [...referenced];
  while (queue.length) {
    const decl = queue.shift();
    if (seen.has(decl)) continue;
    seen.add(decl);
    const more = new Set();
    if (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl.type)) {
      const props = checker
        .getPropertiesOfType(checker.getTypeAtLocation(decl.name))
        .map((symbol) => {
          const { entry, typeNode } = member(symbol);
          if (typeNode) localReferences(typeNode, source, more);
          return entry;
        });
      types.push({ name: decl.name.text, props });
    } else {
      localReferences(decl.type, source, more);
      types.push({ name: decl.name.text, type: oneLine(decl.type, 400) });
    }
    queue.push(...more);
  }
  types.sort((a, b) => a.name.localeCompare(b.name));

  return { component: component.name.text, props: [...own, ...inherited], types };
}

const prettierConfig = (await prettier.resolveConfig(join(BLOCKS, "api.json"))) ?? {};
const stale = [];
for (const file of files) {
  const out = join(dirname(file), "api.json");
  const json = await prettier.format(JSON.stringify(describeBlock(file)), {
    ...prettierConfig,
    parser: "json",
  });
  if (existsSync(out) && readFileSync(out, "utf8") === json) continue;
  stale.push(relative(ROOT, out));
  if (!check) writeFileSync(out, json);
}

if (check) {
  if (stale.length) {
    console.error(`stale props references (run \`pnpm generate:api\`):\n  ${stale.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`all ${files.length} props references are up to date`);
} else {
  console.log(`props references: ${stale.length} of ${files.length} written`);
}
