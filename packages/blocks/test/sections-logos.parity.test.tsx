import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Logos } from "../src/sections/logos/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/logos");

runGoldenParity("sections/logos", {
  blockDir,
  Component: Logos,
});
