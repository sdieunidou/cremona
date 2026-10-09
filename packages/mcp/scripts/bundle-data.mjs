/**
 * prepack: copy the library data the server reads into packages/mcp/data/, mirroring
 * the monorepo layout, so the published package runs without a cremona checkout.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(pkgRoot, "..", "..");
const out = join(pkgRoot, "data");

if (!existsSync(join(repoRoot, "packages", "blocks", "catalog.json"))) {
  throw new Error("bundle-data must run inside the cremona monorepo");
}

rmSync(out, { recursive: true, force: true });
const copy = (from) => cpSync(join(repoRoot, from), join(out, from), { recursive: true });

copy("packages/blocks/catalog.json");
copy("packages/blocks/src");
copy("packages/tokens/themes.json");
copy("packages/tokens/css");
copy("packages/stimulus/src");
copy("packages/stimulus/templates");
copy("packages/ui/registry.json");
copy("packages/ui/r");
mkdirSync(join(out, "docs"), { recursive: true });
for (const file of readdirSync(join(repoRoot, "docs"))) {
  if (file.endsWith(".md")) copy(`docs/${file}`);
}
console.log(`bundled library data into ${out}`);
