import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CookieBanner } from "../src/notices/cookie-banner/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/notices/cookie-banner",
);

runGoldenParity("notices/cookie-banner", {
  blockDir,
  Component: CookieBanner,
});
