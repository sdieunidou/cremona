import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Terminal } from "../src/code/terminal/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/code/terminal");

runGoldenParity("code/terminal", {
  blockDir,
  Component: Terminal,
});
