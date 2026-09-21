import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 45000,
  webServer: {
    command: "npx vite preview --port 4179 --strictPort",
    port: 4179,
    reuseExistingServer: false,
  },
  use: { baseURL: "http://localhost:4179" },
  workers: 1,
});
