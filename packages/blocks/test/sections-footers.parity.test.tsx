import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Footer } from "../src/sections/footers/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/footers");

runGoldenParity("sections/footers", {
  blockDir,
  Component: Footer,
});
