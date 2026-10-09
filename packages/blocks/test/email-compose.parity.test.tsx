import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Compose } from "../src/email/compose/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/email/compose");

runGoldenParity("email/compose", {
  blockDir,
  Component: Compose,
});
