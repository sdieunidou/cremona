import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProductGrid } from "../src/ecommerce/product-grid/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ecommerce/product-grid");

runGoldenParity("ecommerce/product-grid", {
  blockDir,
  Component: ProductGrid,
});
