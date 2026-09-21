import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TabBar } from "../src/mobile/tab-bar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/mobile/tab-bar");

runGoldenParity("mobile/tab-bar", {
  blockDir,
  Component: TabBar,
});
