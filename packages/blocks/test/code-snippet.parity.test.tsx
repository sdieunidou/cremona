import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Snippet } from "../src/code/snippet/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/code/snippet");

runGoldenParity("code/snippet", {
  blockDir,
  Component: Snippet,
});
