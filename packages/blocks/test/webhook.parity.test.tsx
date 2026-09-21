import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Webhook } from "../src/api/webhook/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/api/webhook");

runGoldenParity("api/webhook", {
  blockDir,
  Component: Webhook,
});
