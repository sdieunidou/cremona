import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Thread } from "../src/chat/thread/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/chat/thread");

// custom thread props are a spread identifier (`...i`) in the POC page chunk.
const customThread = {
  parentUser: "Jordan Liu",
  parentInitials: "JL",
  parentTime: "Yesterday",
  parentText:
    "Anyone else loving the new dashboard widgets? They feel so much faster.",
  replies: [
    { user: "Ada Lovelace", initials: "AL", text: "Yes, the optimistic updates make a huge difference.", time: "9:02" },
    { user: "Grace Hopper", initials: "GH", text: "Latency is down ~40% on my account.", time: "9:10" },
  ],
};

runGoldenParity("chat/thread", {
  blockDir,
  Component: Thread,
  variants: [
    { label: "default · custom thread", props: { ...customThread } },
    { label: "isometric · custom thread", props: { isometric: true, ...customThread } },
  ],
});
