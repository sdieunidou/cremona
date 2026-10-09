import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorSection } from "../src/sections/error/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/error");

runGoldenParity("sections/error", {
  blockDir,
  Component: ErrorSection,
});
