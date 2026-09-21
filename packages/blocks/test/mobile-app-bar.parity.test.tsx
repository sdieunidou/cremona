import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppBar } from "../src/mobile/app-bar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/mobile/app-bar");

runGoldenParity("mobile/app-bar", {
  blockDir,
  Component: AppBar,
});
