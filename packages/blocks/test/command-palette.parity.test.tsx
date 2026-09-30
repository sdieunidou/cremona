import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CreditCard, GitBranch, LifeBuoy, Users } from "lucide-react";
import { CommandPalette } from "../src/search/command-palette/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/search/command-palette");

// icons as components: they render like the POC's `<Icon className="size-3" strokeWidth={2.5} />`
// elements and serialize to "lucide:<Name>" in preview-props

runGoldenParity("search/command-palette", {
  blockDir,
  Component: CommandPalette,
  variants: [
    // propsRaw embeds JSX icon identifiers; resolved manually here.
    {
      label: "support · custom copy",
      props: {
        query: "billing",
        groups: [
          {
            label: "Billing",
            items: [
              {
                icon: CreditCard,
                label: "Update payment method",
                shortcut: ["⌘", "B"],
              },
              { icon: Users, label: "Manage seats" },
            ],
          },
          {
            label: "Help",
            items: [{ icon: LifeBuoy, label: "Contact support" }],
          },
        ],
      },
    },
    {
      label: "single group",
      props: {
        query: "deploy",
        groups: [
          {
            label: "Deployments",
            items: [
              {
                icon: GitBranch,
                label: "Deploy to production",
                shortcut: ["⌘", "↵"],
              },
              { icon: GitBranch, label: "Roll back last deploy" },
            ],
          },
        ],
      },
    },
  ],
});
