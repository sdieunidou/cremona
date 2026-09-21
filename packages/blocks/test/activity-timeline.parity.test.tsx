import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Timeline } from "../src/activity/timeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/activity/timeline");

// Test name disambiguated from sections/timeline. The custom-steps props come
// from the POC page chunk (identifier `i` in propsRaw).
const onboardingSteps = [
  { title: "Account created", detail: "Workspace provisioned", time: "3d", status: "done" },
  { title: "Team invited", detail: "8 members joined", time: "1d", status: "done" },
  { title: "Integrations setup", detail: "Slack, GitHub, Linear", time: "Today", status: "active" },
  { title: "First project shipped", detail: "Launch with stakeholders", time: "Next", status: "pending" },
];

runGoldenParity("activity/timeline", {
  blockDir,
  Component: Timeline,
  variants: [
    { label: "default · custom steps", props: { title: "Onboarding", meta: "Q2", steps: onboardingSteps } },
    { label: "isometric · custom steps", props: { isometric: true, title: "Onboarding", meta: "Q2", steps: onboardingSteps } },
  ],
});
