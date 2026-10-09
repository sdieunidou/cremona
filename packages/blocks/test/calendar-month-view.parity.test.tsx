import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MonthView } from "../src/calendar/month-view/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/calendar/month-view");

runGoldenParity("calendar/month-view", {
  blockDir,
  Component: MonthView,
});
