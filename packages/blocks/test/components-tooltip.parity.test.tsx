import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Tooltip } from "../src/components/tooltip/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/tooltip");

runGoldenParity("components/tooltip", {
  blockDir,
  Component: Tooltip,
});
