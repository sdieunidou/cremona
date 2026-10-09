import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Retrieval } from "../src/ai/retrieval/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/retrieval");

runGoldenParity("ai/retrieval", {
  blockDir,
  Component: Retrieval,
});
