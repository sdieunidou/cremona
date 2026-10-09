import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Lock } from "../src/security/lock/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/lock");

runGoldenParity("security/lock", {
  blockDir,
  Component: Lock,
});
