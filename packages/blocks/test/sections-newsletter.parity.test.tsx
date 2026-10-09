import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Newsletter } from "../src/sections/newsletter/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/newsletter");

runGoldenParity("sections/newsletter", {
  blockDir,
  Component: Newsletter,
});
