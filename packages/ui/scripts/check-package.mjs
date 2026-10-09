/**
 * Pack @cremona/ui the way it is published, then check the tarball: publint, attw on every
 * component entry point (ESM-only profile), and the files a project relies on (the registry).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: pkgRoot, stdio: "inherit", ...opts });

const components = readdirSync(join(pkgRoot, "src"))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort();

const out = mkdtempSync(join(tmpdir(), "cremona-ui-pack-"));
try {
  run("pnpm", ["pack", "--pack-destination", out], { stdio: ["ignore", "ignore", "inherit"] });
  const tarball = join(
    out,
    readdirSync(out).find((file) => file.endsWith(".tgz")),
  );
  run("tar", ["xzf", tarball, "-C", out]);
  const pkg = join(out, "package");

  const problems = [];
  for (const name of [...components, "utils"]) {
    for (const file of [`${name}.js`, `${name}.d.ts`])
      if (!existsSync(join(pkg, "dist", file))) problems.push(`dist/${file} missing`);
  }
  for (const name of components) {
    const entry = join(pkg, "dist", `${name}.js`);
    if (!existsSync(entry)) continue;
    const code = readFileSync(entry, "utf8");
    if (/from "\.\/(?!utils|[a-z-]+)/.test(code)) problems.push(`${name}: odd relative import`);
    const hooks = /\b(use[A-Z]\w*|createContext)\(/.test(code);
    if (hooks && !code.startsWith('"use client";'))
      problems.push(`${name}: uses hooks and does not start with "use client"`);
  }
  for (const file of ["registry.json", "r/registry.json", "r/button.json"])
    if (!existsSync(join(pkg, file))) problems.push(`${file} not shipped`);
  for (const unexpected of ["src", "test", "scripts"]) {
    if (existsSync(join(pkg, unexpected))) problems.push(`tarball contains ${unexpected}/`);
  }
  if (problems.length > 0) throw new Error(`package contents:\n  ${problems.join("\n  ")}`);

  run("pnpm", ["exec", "publint", "run", tarball, "--strict"]);
  const attw = ["exec", "attw", tarball, "--profile", "esm-only", "--include-entrypoints"];
  const entrypoints = [...components, "utils"].map((name) => `./${name}`);
  try {
    run("pnpm", [...attw, ...entrypoints, "--quiet"]);
  } catch {
    run("pnpm", [...attw, ...entrypoints, "--format", "ascii"]);
  }
  console.log(`@cremona/ui: tarball OK (${components.length} components)`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
