import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DocsShell } from "../src/layouts/docs-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/docs-shell");

runGoldenParity("layouts/docs-shell", {
  blockDir,
  Component: DocsShell,
});
