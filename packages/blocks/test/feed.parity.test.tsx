import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Feed, type FeedItem } from "../src/activity/feed/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/activity/feed");

// custom items from the POC page chunk (`items:i` — identifier, resolved by hand)
const customItems: FeedItem[] = [
  { user: "Ada Lovelace", initials: "AL", action: "commit", title: "pushed to analytics", detail: "2 commits · lib/metrics.ts", time: "5m" },
  { user: "Grace Hopper", initials: "GH", action: "deploy", title: "deployed v3.0.0", detail: "staging · 2m 18s", time: "22m" },
  { user: "Linus Torvalds", initials: "LT", action: "merge", title: "merged PR #87", detail: "fix: kernel scheduler", time: "1h" },
];

runGoldenParity("activity/feed", {
  blockDir,
  Component: Feed,
  variants: [
    { label: "default · custom items", props: { title: "Team activity", meta: "This week", items: customItems } },
    { label: "isometric · custom items", props: { isometric: true, title: "Team activity", meta: "This week", items: customItems } },
  ],
});
