import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Kanban } from "../src/tasks/kanban/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/tasks/kanban");

runGoldenParity("tasks/kanban", {
  blockDir,
  Component: Kanban,
});
