import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatePicker } from "../src/calendar/date-picker/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/calendar/date-picker");

runGoldenParity("calendar/date-picker", {
  blockDir,
  Component: DatePicker,
});
