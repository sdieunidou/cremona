import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PromptBox } from "../src/ai/prompt-box/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/prompt-box");

runGoldenParity("ai/prompt-box", {
  blockDir,
  Component: PromptBox,
});
