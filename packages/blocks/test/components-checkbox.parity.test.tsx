import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Checkbox } from "../src/components/checkbox/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/checkbox");

runGoldenParity("components/checkbox", {
  blockDir,
  Component: Checkbox,
});
