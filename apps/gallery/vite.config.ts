import { readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const blocksSrc = new URL("../../packages/blocks/src/", import.meta.url);

/** Total variant count, so the home page states it without loading every block.json. */
function countVariants(): number {
  let count = 0;
  for (const category of readdirSync(blocksSrc, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const block of readdirSync(new URL(`${category.name}/`, blocksSrc))) {
      try {
        const meta = readFileSync(
          new URL(`${category.name}/${block}/block.json`, blocksSrc),
          "utf8",
        );
        count += (JSON.parse(meta) as { variants: unknown[] }).variants.length;
      } catch {
        /* not a block directory */
      }
    }
  }
  return count;
}

export default defineConfig({
  plugins: [
    react({
      // blocks live outside this app's root (monorepo) — transform them too
      include: [/\/apps\/gallery\/src\/.*\.[tj]sx?$/, /\/packages\/blocks\/src\/.*\.tsx$/],
    }),
  ],
  define: {
    __CREMONA_VARIANTS__: JSON.stringify(countVariants()),
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@cremona/tokens": new URL("../../packages/tokens", import.meta.url).pathname,
      "@cremona/core/land-mask": new URL("../../packages/core/src/land-mask.ts", import.meta.url)
        .pathname,
      "@cremona/core": new URL("../../packages/core/src/index.ts", import.meta.url).pathname,
      "@cremona/react": new URL("../../packages/react/src/index.ts", import.meta.url).pathname,
    },
  },
  server: {
    fs: {
      // allow importing block sources from the monorepo packages
      allow: [new URL("../../..", import.meta.url).pathname],
    },
  },
});
