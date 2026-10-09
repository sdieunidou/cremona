import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Loading } from "../src/browser/loading/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/browser/loading");

runGoldenParity("browser/loading", {
  blockDir,
  Component: Loading,
});
