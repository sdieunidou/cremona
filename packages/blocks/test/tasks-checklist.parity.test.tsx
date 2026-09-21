import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Checklist } from "../src/tasks/checklist/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/tasks/checklist",
);

// No identifier props in this block's variants (the Flag icon is hardcoded in
// the component), so every variant resolves from block.json propsRaw alone.
runGoldenParity("tasks/checklist", {
  blockDir,
  Component: Checklist,
});
