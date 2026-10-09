import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bubbles } from "../src/chat/bubbles/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/bubbles");

runGoldenParity("chat/bubbles", {
  blockDir,
  Component: Bubbles,
});
