import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HealthCheck } from "../src/status/health-check/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/status/health-check");

runGoldenParity("status/health-check", {
  blockDir,
  Component: HealthCheck,
});
