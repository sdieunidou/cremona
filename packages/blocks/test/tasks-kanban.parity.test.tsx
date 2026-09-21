import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Kanban } from "../src/tasks/kanban/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/tasks/kanban",
);

// No identifier props in this block's variants (MessageSquare/Paperclip icons
// are hardcoded in the component), so every variant resolves from block.json
// propsRaw alone.
runGoldenParity("tasks/kanban", {
  blockDir,
  Component: Kanban,
});
