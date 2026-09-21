import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Alert } from "../src/components/alert/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/alert");

runGoldenParity("components/alert", {
  blockDir,
  Component: Alert,
});
