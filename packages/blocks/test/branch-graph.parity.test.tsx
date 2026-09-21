import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BranchGraph } from "../src/git/branch-graph/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/git/branch-graph",
);

runGoldenParity("git/branch-graph", {
  blockDir,
  Component: BranchGraph,
});
