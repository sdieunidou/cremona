import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BuildingComplex, FileText, User } from "lucide-react";
import { Results } from "../src/search/results/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/search/results");

// icon ReactNodes for the custom-copy variants (from the POC page chunk)
const icon = (Icon: typeof FileText) => <Icon className="size-3" strokeWidth={2.5} />;

runGoldenParity("search/results", {
  blockDir,
  Component: Results,
  variants: [
    // propsRaw embeds JSX icon identifiers; resolved manually here.
    {
      label: "people · custom copy",
      props: {
        query: "chen",
        stats: "24 results in 0.04s",
        filters: ["All", "People", "Teams"],
        activeFilter: 1,
        results: [
          {
            icon: icon(User),
            title: "Sarah Chen",
            path: "Design › Product",
            snippet: "Chen leads the design system and motion guidelines.",
            meta: "Person",
          },
          {
            icon: icon(BuildingComplex),
            title: "Chen Labs",
            path: "Accounts › Enterprise",
            snippet: "Renewal scheduled for March, 240 seats active.",
            meta: "Account",
          },
        ],
      },
    },
    {
      label: "docs · isometric",
      props: {
        isometric: true,
        query: "rate limit",
        stats: "62 results in 0.05s",
        results: [
          {
            icon: icon(FileText),
            title: "Rate limits by plan",
            path: "docs.acme.com › limits",
            snippet: "Every plan has a rate limit measured per minute.",
            meta: "Docs",
          },
          {
            icon: icon(FileText),
            title: "Handling 429 responses",
            path: "docs.acme.com › api › errors",
            snippet: "Back off and retry when a rate limit is returned.",
            meta: "API",
          },
        ],
      },
    },
  ],
});
