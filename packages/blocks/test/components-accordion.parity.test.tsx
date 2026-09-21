import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Accordion } from "../src/components/accordion/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/accordion");

runGoldenParity("components/accordion", {
  blockDir,
  Component: Accordion,
});
