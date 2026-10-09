import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Shield } from "../src/security/shield/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/shield");

runGoldenParity("security/shield", {
  blockDir,
  Component: Shield,
});
