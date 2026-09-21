import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AgentFlow } from "../src/ai/agent-flow/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/agent-flow");

runGoldenParity("ai/agent-flow", {
  blockDir,
  Component: AgentFlow,
});
