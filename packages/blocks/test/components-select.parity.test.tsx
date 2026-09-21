import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Select } from "../src/components/select/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/select");

runGoldenParity("components/select", {
  blockDir,
  Component: Select,
});
