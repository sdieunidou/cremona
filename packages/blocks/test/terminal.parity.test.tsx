import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Terminal } from "../src/code/terminal/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/code/terminal");

// `lines` is an identifier (`i`) in the POC page chunk — resolved here.
const customLines = [
  { kind: "command", text: "git status" },
  { kind: "muted", text: "On branch main" },
  { kind: "info", text: "Changes to be committed:" },
  { kind: "success", text: "  modified:  README.md" },
  { kind: "success", text: "  new file:  hello.txt" },
  { kind: "command", text: "" },
];

runGoldenParity("code/terminal", {
  blockDir,
  Component: Terminal,
  variants: [
    { label: "custom lines", props: { title: "~/project · git", lines: customLines } },
  ],
});
