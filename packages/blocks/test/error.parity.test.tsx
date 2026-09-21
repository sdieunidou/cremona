import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Error } from "../src/sections/error/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/error",
);

// the minified sources may be inconsistent with the extracted goldens; the
// golden HTML + block.json are the authority here.
runGoldenParity("sections/error", {
  blockDir,
  Component: Error,
});
