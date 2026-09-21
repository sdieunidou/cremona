import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Feedback } from "../src/forms/feedback/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/forms/feedback");

runGoldenParity("forms/feedback", {
  blockDir,
  Component: Feedback,
});
