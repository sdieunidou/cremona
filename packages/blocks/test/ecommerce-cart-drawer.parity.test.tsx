import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CartDrawer } from "../src/ecommerce/cart-drawer/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/cart-drawer");

runGoldenParity("ecommerce/cart-drawer", {
  blockDir,
  Component: CartDrawer,
});
