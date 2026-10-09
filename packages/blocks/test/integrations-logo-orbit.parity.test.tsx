import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LogoOrbit } from "../src/integrations/logo-orbit/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/integrations/logo-orbit");

runGoldenParity("integrations/logo-orbit", {
  blockDir,
  Component: LogoOrbit,
});
