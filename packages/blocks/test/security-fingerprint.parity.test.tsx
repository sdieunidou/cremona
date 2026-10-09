import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Fingerprint } from "../src/security/fingerprint/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/fingerprint");

runGoldenParity("security/fingerprint", {
  blockDir,
  Component: Fingerprint,
});
