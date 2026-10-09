import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorState } from "../src/states/error/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/states/error");

runGoldenParity("states/error", {
  blockDir,
  Component: ErrorState,
});
