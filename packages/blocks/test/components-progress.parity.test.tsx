import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Progress } from "../src/components/progress/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/progress");

runGoldenParity("components/progress", {
  blockDir,
  Component: Progress,
});
