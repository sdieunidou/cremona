import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MarketingShell } from "../src/layouts/marketing-shell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/layouts/marketing-shell");

runGoldenParity("layouts/marketing-shell", {
  blockDir,
  Component: MarketingShell,
});
