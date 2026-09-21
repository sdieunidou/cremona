import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Presence } from "../src/ai/presence/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/presence");

runGoldenParity("ai/presence", {
  blockDir,
  Component: Presence,
  variants: [
    // avatar prop is an asset-URL identifier in the POC page chunk
    {
      label: "photo avatar",
      props: {
        collaborators: [
          { name: "You", kind: "user", initials: "JC", avatar: "../../media/placeholders/avatar-01.jpg" },
          { name: "Research Agent", kind: "agent", color: "text-purple-600 dark:text-purple-500" },
          { name: "Coding Agent", kind: "agent", color: "text-sky-600 dark:text-sky-500" },
        ],
      },
    },
  ],
});
