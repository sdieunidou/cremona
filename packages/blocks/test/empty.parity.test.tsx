import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Empty } from "../src/states/empty/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/states/empty",
);

runGoldenParity("states/empty", {
  blockDir,
  Component: Empty,
});
