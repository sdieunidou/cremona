import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SimpleFile } from "../src/files/simple/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/files/simple");

runGoldenParity("files/simple", {
  blockDir,
  Component: SimpleFile,
});
