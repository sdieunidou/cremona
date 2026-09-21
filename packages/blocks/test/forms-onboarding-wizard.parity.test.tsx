import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { OnboardingWizard } from "../src/forms/onboarding-wizard/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/forms/onboarding-wizard");

runGoldenParity("forms/onboarding-wizard", {
  blockDir,
  Component: OnboardingWizard,
});
