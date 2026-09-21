import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Shortcut } from "../src/keyboard/shortcut/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/keyboard/shortcut",
);

// all propsRaw values are plain literals — no explicit variant props needed
runGoldenParity("keyboard/shortcut", {
  blockDir,
  Component: Shortcut,
});
