import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PullRequest } from "../src/git/pull-request/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/git/pull-request");

runGoldenParity("git/pull-request", {
  blockDir,
  Component: PullRequest,
});
