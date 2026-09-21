import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Trend } from "../src/metrics/trend/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/metrics/trend");

runGoldenParity("metrics/trend", {
  blockDir,
  Component: Trend,
});
