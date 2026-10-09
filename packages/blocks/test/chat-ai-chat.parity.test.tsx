import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AiChat } from "../src/chat/ai-chat/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/ai-chat");

runGoldenParity("chat/ai-chat", {
  blockDir,
  Component: AiChat,
});
