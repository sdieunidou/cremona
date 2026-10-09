import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Timeline } from "../src/activity/timeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/activity/timeline");

runGoldenParity("activity/timeline", {
  blockDir,
  Component: Timeline,
});
