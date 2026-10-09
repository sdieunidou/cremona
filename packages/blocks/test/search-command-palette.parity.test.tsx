import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CommandPalette } from "../src/search/command-palette/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/search/command-palette");

runGoldenParity("search/command-palette", {
  blockDir,
  Component: CommandPalette,
});
