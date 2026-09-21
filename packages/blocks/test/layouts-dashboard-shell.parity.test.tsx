import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DashboardShell } from "../src/layouts/dashboard-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/dashboard-shell");

runGoldenParity("layouts/dashboard-shell", {
  blockDir,
  Component: DashboardShell,
});
