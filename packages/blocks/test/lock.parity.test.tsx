import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Lock } from "../src/security/lock/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/lock");

runGoldenParity("security/lock", {
  blockDir,
  Component: Lock,
  variants: [
    // propsRaw is empty in block.json for these; exact props from the POC page chunk
    { label: 'label="Secure"', props: { label: "Secure" } },
    { label: 'state="unlocked"', props: { state: "unlocked" } },
    { label: 'isometric · state="unlocked"', props: { state: "unlocked", isometric: true } },
    { label: 'state="error"', props: { state: "error" } },
    { label: 'isometric · state="error"', props: { state: "error", isometric: true } },
  ],
});
