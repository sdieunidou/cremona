import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Laptop } from "../src/devices/laptop/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/devices/laptop");

runGoldenParity("devices/laptop", {
  blockDir,
  Component: Laptop,
});
