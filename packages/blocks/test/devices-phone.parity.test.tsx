import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Phone } from "../src/devices/phone/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/devices/phone");

runGoldenParity("devices/phone", {
  blockDir,
  Component: Phone,
});
