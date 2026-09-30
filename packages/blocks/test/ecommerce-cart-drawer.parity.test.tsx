import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CartDrawer } from "../src/ecommerce/cart-drawer/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; strip that
// version noise so the golden comparison stays structural (see components/avatar).

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/cart-drawer");

runGoldenParity("ecommerce/cart-drawer", {
  blockDir,
  Component: CartDrawer,
});
