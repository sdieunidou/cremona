import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PinDrop } from "../src/geo/pin-drop/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/geo/pin-drop");

runGoldenParity("geo/pin-drop", {
  blockDir,
  Component: PinDrop,
});
