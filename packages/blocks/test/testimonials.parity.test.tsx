import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Testimonials } from "../src/sections/testimonials/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/testimonials");

runGoldenParity("sections/testimonials", {
  blockDir,
  Component: Testimonials,
});
