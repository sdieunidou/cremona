import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Comparison } from "../src/metrics/comparison/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/metrics/comparison");

runGoldenParity("metrics/comparison", {
  blockDir,
  Component: Comparison,
});
