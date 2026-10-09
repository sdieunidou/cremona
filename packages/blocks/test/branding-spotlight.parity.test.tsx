import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Spotlight } from "../src/branding/spotlight/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/branding/spotlight");

runGoldenParity("branding/spotlight", {
  blockDir,
  Component: Spotlight,
});
