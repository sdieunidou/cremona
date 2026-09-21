import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ListRows } from "../src/mobile/list-rows/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/mobile/list-rows");

runGoldenParity("mobile/list-rows", {
  blockDir,
  Component: ListRows,
});
