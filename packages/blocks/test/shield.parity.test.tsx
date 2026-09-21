import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Shield } from "../src/security/shield/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/shield");

runGoldenParity("security/shield", {
  blockDir,
  Component: Shield,
  variants: [
    // propsRaw is empty in block.json for these; exact props from the POC page chunk
    { label: 'label="End-to-end"', props: { label: "End-to-end" } },
    { label: 'state="warning"', props: { state: "warning" } },
    { label: 'isometric · state="warning"', props: { state: "warning", isometric: true } },
    { label: 'state="breached"', props: { state: "breached" } },
    { label: 'isometric · state="breached"', props: { state: "breached", isometric: true } },
  ],
});
