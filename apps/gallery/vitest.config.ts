import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
      globals: true,
    },
  }),
);
