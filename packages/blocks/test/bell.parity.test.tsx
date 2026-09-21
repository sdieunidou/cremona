import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bell } from "../src/notifications/bell/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/notifications/bell",
);

runGoldenParity("notifications/bell", {
  blockDir,
  Component: Bell,
});
