import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Skeleton } from "../src/components/skeleton/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/skeleton");

runGoldenParity("components/skeleton", {
  blockDir,
  Component: Skeleton,
});
