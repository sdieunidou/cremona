import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ActionSheet } from "../src/mobile/action-sheet/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/mobile/action-sheet");

runGoldenParity("mobile/action-sheet", {
  blockDir,
  Component: ActionSheet,
});
