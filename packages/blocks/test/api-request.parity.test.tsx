import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Request } from "../src/api/request/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/api/request");

runGoldenParity("api/request", {
  blockDir,
  Component: Request,
});
