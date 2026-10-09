import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Timeline } from "../src/sections/timeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/timeline");

runGoldenParity("sections/timeline", {
  blockDir,
  Component: Timeline,
});
