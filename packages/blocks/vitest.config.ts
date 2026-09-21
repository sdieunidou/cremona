import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@cremona/core": new URL("../core/src/index.ts", import.meta.url).pathname,
      "@cremona/react": new URL("../react/src/index.ts", import.meta.url).pathname,
    },
  },
});
