import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.js", "test/**/*.test.mjs"],
    testTimeout: 30000,
    globals: true,
  },
});
