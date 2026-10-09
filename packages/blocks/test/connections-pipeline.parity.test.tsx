import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/pipeline");

runGoldenParity("connections/pipeline", {
  blockDir,
  Component: Pipeline,
});
