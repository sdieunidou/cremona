import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Hub } from "../src/integrations/hub/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/integrations/hub");

runGoldenParity("integrations/hub", {
  blockDir,
  Component: Hub,
});
