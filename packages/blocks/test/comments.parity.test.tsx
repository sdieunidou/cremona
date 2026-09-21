import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Comments } from "../src/sections/comments/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/comments",
);

runGoldenParity("sections/comments", {
  blockDir,
  Component: Comments,
});
