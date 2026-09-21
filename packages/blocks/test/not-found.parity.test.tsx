import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NotFound } from "../src/states/not-found/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/states/not-found",
);

runGoldenParity("states/not-found", {
  blockDir,
  Component: NotFound,
});
