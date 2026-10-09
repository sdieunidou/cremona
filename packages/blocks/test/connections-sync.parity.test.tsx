import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Sync } from "../src/connections/sync/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/sync");

runGoldenParity("connections/sync", {
  blockDir,
  Component: Sync,
});
