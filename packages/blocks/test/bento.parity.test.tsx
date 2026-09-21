import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bento } from "../src/sections/bento/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/bento",
);

runGoldenParity("sections/bento", {
  blockDir,
  Component: Bento,
});
