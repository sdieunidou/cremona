import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Toast } from "../src/notifications/toast/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/notifications/toast",
);

runGoldenParity("notifications/toast", {
  blockDir,
  Component: Toast,
});
