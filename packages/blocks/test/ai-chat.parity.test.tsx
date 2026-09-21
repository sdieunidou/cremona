import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AiChat } from "../src/chat/ai-chat/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/ai-chat");

// `response` is an identifier (`i`) in the POC page chunk — resolved here.
const customResponse = [
  { kind: "paragraph", text: "Sure, here's a draft you can tune:" },
  { kind: "bullet", text: "Subject: A simpler way to scale with Acme" },
  { kind: "bullet", text: "Opens with the customer pain point you mentioned" },
  { kind: "bullet", text: "Closes with a soft CTA to upgrade in one click" },
];

runGoldenParity("chat/ai-chat", {
  blockDir,
  Component: AiChat,
  variants: [
    { label: "default · custom copy", props: { title: "Acme Copilot", prompt: "Draft a launch email for our new pricing", response: customResponse } },
    { label: "isometric · custom copy", props: { isometric: true, title: "Acme Copilot", prompt: "Draft a launch email for our new pricing", response: customResponse } },
  ],
});
