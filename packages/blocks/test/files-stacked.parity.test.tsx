import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Stacked } from "../src/files/stacked/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/files/stacked");

runGoldenParity("files/stacked", {
  blockDir,
  Component: Stacked,
});
