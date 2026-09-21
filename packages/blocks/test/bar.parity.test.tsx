import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bar } from "../src/charts/bar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/charts/bar");

runGoldenParity("charts/bar", {
  blockDir,
  Component: Bar,
});
