import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Converge } from "../src/connections/converge/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/converge");

runGoldenParity("connections/converge", {
  blockDir,
  Component: Converge,
});
