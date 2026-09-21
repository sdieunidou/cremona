import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SettingsForm } from "../src/forms/settings-form/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/forms/settings-form");

runGoldenParity("forms/settings-form", {
  blockDir,
  Component: SettingsForm,
});
