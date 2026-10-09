import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Globe } from "../src/geo/globe/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/geo/globe");

runGoldenParity("geo/globe", {
  blockDir,
  Component: Globe,
});
