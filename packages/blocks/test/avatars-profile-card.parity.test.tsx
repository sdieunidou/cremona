import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProfileCard } from "../src/avatars/profile-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/avatars/profile-card");

runGoldenParity("avatars/profile-card", {
  blockDir,
  Component: ProfileCard,
});
