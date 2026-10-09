import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Presence } from "../src/ai/presence/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/presence");

runGoldenParity("ai/presence", {
  blockDir,
  Component: Presence,
});
