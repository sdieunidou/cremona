import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MobileAppShell } from "../src/layouts/mobile-app-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/mobile-app-shell");

runGoldenParity("layouts/mobile-app-shell", {
  blockDir,
  Component: MobileAppShell,
});
