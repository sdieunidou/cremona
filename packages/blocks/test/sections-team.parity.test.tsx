import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Team } from "../src/sections/team/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/team");

runGoldenParity("sections/team", {
  blockDir,
  Component: Team,
});
