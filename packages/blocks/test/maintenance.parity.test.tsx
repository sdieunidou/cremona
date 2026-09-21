import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Maintenance } from "../src/states/maintenance/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/states/maintenance",
);

runGoldenParity("states/maintenance", {
  blockDir,
  Component: Maintenance,
});
