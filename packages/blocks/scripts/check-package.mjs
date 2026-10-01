/**
 * Pack @cremona/blocks the way it is published, then check the tarball: publint,
 * attw on every block entry point (ESM-only profile), and the files a host relies on.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(pkgRoot, "src");
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: pkgRoot, stdio: "inherit", ...opts });

const blocks = readdirSync(src, { withFileTypes: true })
  .filter((category) => category.isDirectory())
  .flatMap((category) =>
    readdirSync(join(src, category.name))
      .filter((block) => existsSync(join(src, category.name, block, "react.tsx")))
      .map((block) => `${category.name}/${block}`),
  )
  .sort();

const out = mkdtempSync(join(tmpdir(), "cremona-blocks-pack-"));
try {
  run("pnpm", ["pack", "--pack-destination", out], { stdio: ["ignore", "ignore", "inherit"] });
  const tarball = join(
    out,
    readdirSync(out).find((file) => file.endsWith(".tgz")),
  );
  run("tar", ["xzf", tarball, "-C", out]);
  const pkg = join(out, "package");

  const problems = [];
  for (const key of blocks) {
    const entry = join(pkg, "dist", key, "react.js");
    if (!existsSync(entry) || !existsSync(join(pkg, "dist", key, "react.d.ts"))) {
      problems.push(`${key}: no compiled entry`);
    } else if (!readFileSync(entry, "utf8").startsWith('"use client";')) {
      problems.push(`${key}: dist entry does not start with "use client"`);
    }
    const source = readFileSync(join(src, key, "react.tsx"), "utf8");
    for (const [path] of source.matchAll(/\/media\/placeholders\/[\w.-]+/g)) {
      if (!existsSync(join(pkg, "public", path))) problems.push(`${key}: ${path} not shipped`);
    }
  }
  for (const unexpected of ["src", "test", "scripts"]) {
    if (existsSync(join(pkg, unexpected))) problems.push(`tarball contains ${unexpected}/`);
  }
  if (problems.length > 0) throw new Error(`package contents:\n  ${problems.join("\n  ")}`);

  run("pnpm", ["exec", "publint", "run", tarball, "--strict"]);
  const attw = ["exec", "attw", tarball, "--profile", "esm-only", "--include-entrypoints"];
  const entrypoints = blocks.map((key) => `./${key}`);
  try {
    run("pnpm", [...attw, ...entrypoints, "--quiet"]);
  } catch {
    run("pnpm", [...attw, ...entrypoints, "--format", "ascii"]);
  }
  console.log(`@cremona/blocks: tarball OK (${blocks.length} entry points)`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
