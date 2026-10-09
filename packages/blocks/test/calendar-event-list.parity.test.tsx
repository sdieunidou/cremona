import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EventList } from "../src/calendar/event-list/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/calendar/event-list");

runGoldenParity("calendar/event-list", {
  blockDir,
  Component: EventList,
});
