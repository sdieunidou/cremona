/**
 * Compile every block to dist/<category>/<file>/react.{js,d.ts} — the entry point
 * behind `@cremona/blocks/<category>/<file>` — and make each entry a client module.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(pkgRoot, "src");
const dist = join(pkgRoot, "dist");
const USE_CLIENT = /^\s*(["'])use client\1;?/;

const blocks = readdirSync(src, { withFileTypes: true })
  .filter((category) => category.isDirectory())
  .flatMap((category) =>
    readdirSync(join(src, category.name), { withFileTypes: true })
      .filter((block) => existsSync(join(src, category.name, block.name, "react.tsx")))
      .map((block) => `${category.name}/${block.name}`),
  )
  .sort();

rmSync(dist, { recursive: true, force: true });
const tsc = createRequire(import.meta.url).resolve("typescript/bin/tsc");
execFileSync(process.execPath, [tsc, "-p", "tsconfig.build.json"], {
  cwd: pkgRoot,
  stdio: "inherit",
});

const withoutDirective = [];
for (const key of blocks) {
  for (const file of ["react.js", "react.d.ts"]) {
    if (!existsSync(join(dist, key, file))) throw new Error(`${key}: dist/${key}/${file} missing`);
  }
  if (!USE_CLIENT.test(readFileSync(join(src, key, "react.tsx"), "utf8"))) {
    withoutDirective.push(key);
  }
  // Blocks use hooks: Next.js must bundle them as client components.
  const entry = join(dist, key, "react.js");
  const code = readFileSync(entry, "utf8");
  if (!USE_CLIENT.test(code)) writeFileSync(entry, `"use client";\n${code}`);
}

if (withoutDirective.length > 0) {
  console.warn(
    `warning: ${withoutDirective.length} block source(s) do not start with "use client" ` +
      `(the build added it to dist): run \`node tools/use-client.mjs\` from the repo root.`,
  );
}
console.log(`@cremona/blocks: ${blocks.length} blocks compiled to dist/`);
