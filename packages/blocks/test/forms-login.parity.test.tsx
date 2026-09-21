import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Login } from "../src/forms/login/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/forms/login");

runGoldenParity("forms/login", {
  blockDir,
  Component: Login,
});
