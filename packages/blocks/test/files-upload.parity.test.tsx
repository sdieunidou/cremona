import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Upload } from "../src/files/upload/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/files/upload");

runGoldenParity("files/upload", {
  blockDir,
  Component: Upload,
});
