import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Tablet } from "../src/devices/tablet/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/devices/tablet");

runGoldenParity("devices/tablet", {
  blockDir,
  Component: Tablet,
});
