import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Faq } from "../src/sections/faq/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/faq",
);

runGoldenParity("sections/faq", {
  blockDir,
  Component: Faq,
});
