import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AvatarGrid } from "../src/avatars/grid/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/avatars/grid");

runGoldenParity("avatars/grid", {
  blockDir,
  Component: AvatarGrid,
});
