import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Query } from "../src/data/query/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data/query");

runGoldenParity("data/query", {
  blockDir,
  Component: Query,
});
