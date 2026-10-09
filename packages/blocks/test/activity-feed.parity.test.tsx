import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Feed } from "../src/activity/feed/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/activity/feed");

runGoldenParity("activity/feed", {
  blockDir,
  Component: Feed,
});
