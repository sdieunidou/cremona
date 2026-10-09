import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Simple } from "../src/browser/simple/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/browser/simple");

runGoldenParity("browser/simple", {
  blockDir,
  Component: Simple,
});
