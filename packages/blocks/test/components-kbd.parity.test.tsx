import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Kbd } from "../src/components/kbd/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/kbd");

runGoldenParity("components/kbd", {
  blockDir,
  Component: Kbd,
});
