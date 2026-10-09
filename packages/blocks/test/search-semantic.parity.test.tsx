import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Semantic } from "../src/search/semantic/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/search/semantic");

runGoldenParity("search/semantic", {
  blockDir,
  Component: Semantic,
});
