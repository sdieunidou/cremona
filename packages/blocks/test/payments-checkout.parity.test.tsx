import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Checkout } from "../src/payments/checkout/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/payments/checkout");

runGoldenParity("payments/checkout", {
  blockDir,
  Component: Checkout,
});
