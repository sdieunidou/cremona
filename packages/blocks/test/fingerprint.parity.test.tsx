import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Fingerprint } from "../src/security/fingerprint/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/security/fingerprint");

runGoldenParity("security/fingerprint", {
  blockDir,
  Component: Fingerprint,
  variants: [
    // propsRaw is empty in block.json for these; exact props from the POC page chunk
    { label: 'status="Authenticated"', props: { status: "Authenticated" } },
    { label: 'state="scanning"', props: { state: "scanning" } },
    { label: 'isometric · state="scanning"', props: { state: "scanning", isometric: true } },
    { label: 'state="error"', props: { state: "error" } },
    { label: 'isometric · state="error"', props: { state: "error", isometric: true } },
  ],
});
