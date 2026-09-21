import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Button } from "../src/components/button/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/button");

runGoldenParity("components/button", {
  blockDir,
  Component: Button,
});
