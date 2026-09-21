import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Toast } from "../src/components/toast/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/toast");

runGoldenParity("components/toast", {
  blockDir,
  Component: Toast,
});
