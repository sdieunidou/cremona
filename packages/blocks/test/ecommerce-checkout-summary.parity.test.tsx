import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CheckoutSummary } from "../src/ecommerce/checkout-summary/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/checkout-summary");

runGoldenParity("ecommerce/checkout-summary", {
  blockDir,
  Component: CheckoutSummary,
});
