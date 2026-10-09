import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StatCard } from "../src/metrics/stat-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/metrics/stat-card");

runGoldenParity("metrics/stat-card", {
  blockDir,
  Component: StatCard,
});
