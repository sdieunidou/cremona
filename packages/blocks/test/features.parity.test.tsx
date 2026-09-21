import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Features } from "../src/sections/features/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/features",
);

runGoldenParity("sections/features", {
  blockDir,
  Component: Features,
});
