import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Carousel } from "../src/images/carousel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/carousel");

runGoldenParity("images/carousel", {
  blockDir,
  Component: Carousel,
});
