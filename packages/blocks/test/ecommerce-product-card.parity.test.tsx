import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProductCard } from "../src/ecommerce/product-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/product-card");

runGoldenParity("ecommerce/product-card", {
  blockDir,
  Component: ProductCard,
});
