import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ResourceMonitor } from "../src/status/resource-monitor/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/status/resource-monitor");

runGoldenParity("status/resource-monitor", {
  blockDir,
  Component: ResourceMonitor,
});
