import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Backgrounds } from "../src/sections/backgrounds/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/backgrounds",
);

runGoldenParity("sections/backgrounds", {
  blockDir,
  Component: Backgrounds,
});
