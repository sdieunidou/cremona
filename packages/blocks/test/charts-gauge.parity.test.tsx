import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Gauge } from "../src/charts/gauge/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/gauge");

runGoldenParity("charts/gauge", {
  blockDir,
  Component: Gauge,
});
