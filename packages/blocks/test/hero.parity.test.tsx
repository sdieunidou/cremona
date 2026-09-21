import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Hero } from "../src/sections/hero/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/hero");

runGoldenParity("sections/hero", {
  blockDir,
  Component: Hero,
});
