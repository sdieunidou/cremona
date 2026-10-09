import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Checklist } from "../src/tasks/checklist/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/tasks/checklist");

runGoldenParity("tasks/checklist", {
  blockDir,
  Component: Checklist,
});
