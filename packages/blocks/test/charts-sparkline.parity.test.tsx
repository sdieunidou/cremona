import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Sparkline } from "../src/charts/sparkline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/sparkline");

runGoldenParity("charts/sparkline", {
  blockDir,
  Component: Sparkline,
});
