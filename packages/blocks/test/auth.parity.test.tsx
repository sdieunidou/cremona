import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Auth } from "../src/sections/auth/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/auth",
);

runGoldenParity("sections/auth", {
  blockDir,
  Component: Auth,
});
