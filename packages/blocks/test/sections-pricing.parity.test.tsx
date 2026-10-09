import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pricing } from "../src/sections/pricing/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/pricing");

runGoldenParity("sections/pricing", {
  blockDir,
  Component: Pricing,
});
