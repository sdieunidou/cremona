import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Half } from "../src/keyboard/half/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/keyboard/half");

runGoldenParity("keyboard/half", {
  blockDir,
  Component: Half,
});
