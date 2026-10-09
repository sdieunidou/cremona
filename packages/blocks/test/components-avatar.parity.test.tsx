import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Avatar } from "../src/components/avatar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/avatar");

runGoldenParity("components/avatar", {
  blockDir,
  Component: Avatar,
});
