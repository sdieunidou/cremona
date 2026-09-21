import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Donut } from "../src/charts/donut/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/donut");

runGoldenParity("charts/donut", {
  blockDir,
  Component: Donut,
});
