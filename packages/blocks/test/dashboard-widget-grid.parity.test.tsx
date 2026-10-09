import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WidgetGrid } from "../src/dashboard/widget-grid/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/dashboard/widget-grid");

runGoldenParity("dashboard/widget-grid", {
  blockDir,
  Component: WidgetGrid,
});
