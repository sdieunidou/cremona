import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Thread } from "../src/chat/thread/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/thread");

runGoldenParity("chat/thread", {
  blockDir,
  Component: Thread,
});
