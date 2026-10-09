import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Stats } from "../src/sections/stats/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/stats");

runGoldenParity("sections/stats", {
  blockDir,
  Component: Stats,
});
