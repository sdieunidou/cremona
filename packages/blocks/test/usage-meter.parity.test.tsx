import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UsageMeter } from "../src/payments/usage-meter/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/payments/usage-meter");

runGoldenParity("payments/usage-meter", {
  blockDir,
  Component: UsageMeter,
});
