import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Line } from "../src/charts/line/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/line");

runGoldenParity("charts/line", {
  blockDir,
  Component: Line,
});
