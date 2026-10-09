import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LogoReel } from "../src/integrations/logo-reel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/integrations/logo-reel");

runGoldenParity("integrations/logo-reel", {
  blockDir,
  Component: LogoReel,
});
