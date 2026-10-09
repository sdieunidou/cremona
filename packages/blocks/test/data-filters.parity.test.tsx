import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Filters } from "../src/data/filters/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data/filters");

runGoldenParity("data/filters", {
  blockDir,
  Component: Filters,
});
