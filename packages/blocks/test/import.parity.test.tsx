import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Import } from "../src/data/import/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data/import");

runGoldenParity("data/import", {
  blockDir,
  Component: Import,
});
