import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { OrderRow } from "../src/ecommerce/order-row/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/order-row");

runGoldenParity("ecommerce/order-row", {
  blockDir,
  Component: OrderRow,
});
