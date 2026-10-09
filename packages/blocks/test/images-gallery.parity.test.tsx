import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Gallery } from "../src/images/gallery/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/gallery");

runGoldenParity("images/gallery", {
  blockDir,
  Component: Gallery,
});
