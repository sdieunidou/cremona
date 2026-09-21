import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UptimeBar } from "../src/status/uptime-bar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/status/uptime-bar");

runGoldenParity("status/uptime-bar", {
  blockDir,
  Component: UptimeBar,
});
