import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MiniPanel } from "../src/dashboard/mini-panel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/dashboard/mini-panel");

runGoldenParity("dashboard/mini-panel", {
  blockDir,
  Component: MiniPanel,
});
