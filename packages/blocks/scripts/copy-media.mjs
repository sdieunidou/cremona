/**
 * prepack: ship the placeholder images the blocks default to (`/media/placeholders/…`)
 * as `public/media/placeholders/`, copied from the gallery's public directory — a host
 * copies the package's `public/` into its own.
 */
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(pkgRoot, "..", "..", "apps", "gallery", "public", "media", "placeholders");
const to = join(pkgRoot, "public", "media", "placeholders");

if (!existsSync(from)) {
  throw new Error(`copy-media: ${from} not found (run inside the cremona monorepo)`);
}

rmSync(join(pkgRoot, "public"), { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(
  `@cremona/blocks: ${readdirSync(to).length} placeholder images copied to public/media/placeholders/`,
);
