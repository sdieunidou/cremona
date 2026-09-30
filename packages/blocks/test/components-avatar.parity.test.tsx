import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Avatar } from "../src/components/avatar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; strip that
// version noise so the golden comparison stays structural (see avatars/stack).

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/avatar");

runGoldenParity("components/avatar", {
  blockDir,
  Component: Avatar,
});
