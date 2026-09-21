import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Tabs } from "../src/components/tabs/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/tabs");

runGoldenParity("components/tabs", {
  blockDir,
  Component: Tabs,
});
