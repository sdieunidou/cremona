import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProductCard } from "../src/ecommerce/product-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; strip that
// version noise so the golden comparison stays structural (see components/avatar).

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/product-card");

runGoldenParity("ecommerce/product-card", {
  blockDir,
  Component: ProductCard,
});
