import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Editor } from "../src/code/editor/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/code/editor");

runGoldenParity("code/editor", {
  blockDir,
  Component: Editor,
});
