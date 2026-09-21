import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AuthShell } from "../src/layouts/auth-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/auth-shell");

runGoldenParity("layouts/auth-shell", {
  blockDir,
  Component: AuthShell,
});
