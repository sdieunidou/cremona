import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // blocks live outside this app's root (monorepo) — transform them too
      include: [/\/apps\/gallery\/src\/.*\.[tj]sx?$/, /\/packages\/blocks\/src\/.*\.tsx$/],
    }),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@cremona/tokens": new URL("../../packages/tokens", import.meta.url).pathname,
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
