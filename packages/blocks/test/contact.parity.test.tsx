import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Contact } from "../src/sections/contact/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/contact",
);

runGoldenParity("sections/contact", {
  blockDir,
  Component: Contact,
});
