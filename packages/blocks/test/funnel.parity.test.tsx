import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Funnel } from "../src/charts/funnel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/funnel");

runGoldenParity("charts/funnel", {
  blockDir,
  Component: Funnel,
});
