import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Diff } from "../src/git/diff/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/git/diff");

runGoldenParity("git/diff", {
  blockDir,
  Component: Diff,
});
