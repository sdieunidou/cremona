import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Flow } from "../src/connections/flow/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/flow");

runGoldenParity("connections/flow", {
  blockDir,
  Component: Flow,
});
