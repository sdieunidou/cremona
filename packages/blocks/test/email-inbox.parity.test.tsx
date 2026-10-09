import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Inbox } from "../src/email/inbox/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/email/inbox");

runGoldenParity("email/inbox", {
  blockDir,
  Component: Inbox,
});
