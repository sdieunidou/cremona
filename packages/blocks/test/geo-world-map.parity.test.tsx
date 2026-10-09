import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WorldMap } from "../src/geo/world-map/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/geo/world-map");

runGoldenParity("geo/world-map", {
  blockDir,
  Component: WorldMap,
});
