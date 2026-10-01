import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
      globals: true,
      // blocks load lazily and every snippet is compiled: leave room on a busy CI machine
      testTimeout: 30000,
      hookTimeout: 60000,
    },
  }),
);
