import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 4179);
const ci = !!process.env.CI;

export default defineConfig({
  testDir: "e2e",
  timeout: 45000,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : 1,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : "list",
  webServer: {
    command: `pnpm exec vite preview --port ${port} --strictPort`,
    port,
    reuseExistingServer: false,
  },
  use: { baseURL: `http://localhost:${port}` },
});
