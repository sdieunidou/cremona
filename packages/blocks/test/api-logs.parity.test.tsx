import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Logs } from "../src/api/logs/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/api/logs");

runGoldenParity("api/logs", {
  blockDir,
  Component: Logs,
});
