import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Signup } from "../src/forms/signup/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/forms/signup");

runGoldenParity("forms/signup", {
  blockDir,
  Component: Signup,
});
