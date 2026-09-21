import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Dialog } from "../src/components/dialog/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/dialog");

runGoldenParity("components/dialog", {
  blockDir,
  Component: Dialog,
});
