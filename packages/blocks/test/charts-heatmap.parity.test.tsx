import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Heatmap } from "../src/charts/heatmap/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/heatmap");

runGoldenParity("charts/heatmap", {
  blockDir,
  Component: Heatmap,
});
