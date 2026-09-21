import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Callout } from "../src/notices/callout/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/notices/callout");

runGoldenParity("notices/callout", {
  blockDir,
  Component: Callout,
});
