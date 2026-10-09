import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CreditCard } from "../src/payments/credit-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/payments/credit-card");

runGoldenParity("payments/credit-card", {
  blockDir,
  Component: CreditCard,
});
