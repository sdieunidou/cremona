import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Voice } from "../src/ai/voice/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/voice");

runGoldenParity("ai/voice", {
  blockDir,
  Component: Voice,
});
