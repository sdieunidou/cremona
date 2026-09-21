import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UpdateBanner } from "../src/notices/update-banner/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/notices/update-banner",
);

runGoldenParity("notices/update-banner", {
  blockDir,
  Component: UpdateBanner,
});
