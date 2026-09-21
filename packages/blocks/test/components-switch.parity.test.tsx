import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Switch } from "../src/components/switch/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/switch");

runGoldenParity("components/switch", {
  blockDir,
  Component: Switch,
});
