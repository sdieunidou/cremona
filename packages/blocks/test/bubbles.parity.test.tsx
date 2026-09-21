import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bubbles } from "../src/chat/bubbles/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/bubbles");

// `messages` is an identifier (`i`) in the POC page chunk — resolved here.
const customMessages = [
  { from: "them", text: "Want to grab coffee tomorrow?", time: "08:12" },
  { from: "me", text: "Yes! 10am at the usual?", time: "08:14" },
  { from: "them", text: "See you there ☕", time: "08:15" },
];

runGoldenParity("chat/bubbles", {
  blockDir,
  Component: Bubbles,
  variants: [
    { label: "default · custom messages", props: { name: "Mia Lee", initials: "ML", status: "Active 2m ago", messages: customMessages } },
    { label: "isometric · custom messages", props: { isometric: true, name: "Mia Lee", initials: "ML", status: "Active 2m ago", messages: customMessages } },
  ],
});
