import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Table } from "../src/data/table/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/data/table");

runGoldenParity("data/table", {
  blockDir,
  Component: Table,
});
