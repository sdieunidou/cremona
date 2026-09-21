import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Table } from "../src/components/table/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/table");

runGoldenParity("components/table", {
  blockDir,
  Component: Table,
});
