import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Stack } from "../src/avatars/stack/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/avatars/stack");

runGoldenParity("avatars/stack", {
  blockDir,
  Component: Stack,
});
