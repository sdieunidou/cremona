import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Explorer } from "../src/files/explorer/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/files/explorer");

runGoldenParity("files/explorer", {
  blockDir,
  Component: Explorer,
});
