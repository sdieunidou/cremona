import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "../src/components/command/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/command");

runGoldenParity("components/command", {
  blockDir,
  Component: Command,
});
