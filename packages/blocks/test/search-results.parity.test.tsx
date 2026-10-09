import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Results } from "../src/search/results/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/search/results");

runGoldenParity("search/results", {
  blockDir,
  Component: Results,
});
