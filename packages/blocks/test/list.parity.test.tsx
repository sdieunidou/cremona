import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NotificationList } from "../src/notifications/list/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/notifications/list",
);

runGoldenParity("notifications/list", {
  blockDir,
  Component: NotificationList,
});
