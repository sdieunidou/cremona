import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Components } from "../src/sections/components/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/components",
);

runGoldenParity("sections/components", {
  blockDir,
  Component: Components,
});
