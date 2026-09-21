import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pagination } from "../src/components/pagination/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/pagination");

runGoldenParity("components/pagination", {
  blockDir,
  Component: Pagination,
});
