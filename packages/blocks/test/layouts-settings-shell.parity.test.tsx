import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SettingsShell } from "../src/layouts/settings-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/settings-shell");

runGoldenParity("layouts/settings-shell", {
  blockDir,
  Component: SettingsShell,
});
