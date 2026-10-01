#!/usr/bin/env node
/**
 * Make `"use client";` the first line of every block (packages/blocks/src/<category>/<file>/react.tsx),
 * so a block copied into a Next.js app, or imported from a Server Component, is a client module.
 * Idempotent: a file that already starts with the directive is left alone; a directive found
 * elsewhere in the file's prologue (after a comment, single-quoted, without semicolon) is moved.
 *
 * Usage: node tools/use-client.mjs           rewrite the files that need it
 *        node tools/use-client.mjs --check   list them and exit 1, write nothing
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKS = join(ROOT, "packages", "blocks", "src");
const DIRECTIVE = '"use client";';
const check = process.argv.includes("--check");

/**
 * The file with `"use client";` as its first line — the file itself when it already is.
 * Only the prologue (leading blank space, comments and directives) is searched for an
 * existing directive to move.
 */
function withUseClient(source) {
  const code = source.replace(/^\uFEFF/, "");
  if (code.startsWith(`${DIRECTIVE}\n`)) return source;
  const token =
    /(\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(["'])(use client|(?:(?!\2)[^\\\n])*)\2[ \t]*;?/y;
  let prologue = "";
  let end = 0;
  let dropped = false;
  for (let match; end < code.length; end = token.lastIndex) {
    token.lastIndex = end;
    if (!(match = token.exec(code))) break;
    if (match[3] === "use client") {
      dropped = true;
    } else {
      // the line break that ended a moved directive goes with it
      prologue += dropped ? match[0].replace(/^[ \t]*\r?\n/, "") : match[0];
      dropped = false;
    }
  }
  const rest = `${prologue.replace(/\n{3,}/g, "\n\n")}${code.slice(end)}`.replace(/^\s*\n/, "");
  return `${DIRECTIVE}\n\n${rest}`;
}

const files = readdirSync(BLOCKS, { withFileTypes: true })
  .filter((category) => category.isDirectory())
  .flatMap((category) =>
    readdirSync(join(BLOCKS, category.name)).map((block) =>
      join(BLOCKS, category.name, block, "react.tsx"),
    ),
  )
  .filter((file) => existsSync(file))
  .sort();

const pending = files.filter((file) => {
  const source = readFileSync(file, "utf8");
  return withUseClient(source) !== source;
});

if (check) {
  if (pending.length > 0) {
    console.error(
      `${pending.length} of ${files.length} blocks do not start with ${DIRECTIVE} ` +
        `— run \`node tools/use-client.mjs\`:\n` +
        pending.map((file) => `  ${relative(ROOT, file)}`).join("\n"),
    );
    process.exit(1);
  }
  console.log(`all ${files.length} blocks start with ${DIRECTIVE}`);
} else {
  for (const file of pending) writeFileSync(file, withUseClient(readFileSync(file, "utf8")));
  console.log(`${DIRECTIVE} written to ${pending.length} of ${files.length} blocks`);
}
