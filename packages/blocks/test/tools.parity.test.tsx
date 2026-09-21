import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Calendar, CreditCard, Database, GitBranch, Globe, MessageSquare } from "lucide-react";
import { Tools } from "../src/ai/tools/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/ai/tools");

// icon elements for the custom-copy variants (resolved from the golden lucide classes)
const icon = (Icon: typeof Database) => <Icon className="size-3.5" strokeWidth={2} />;

runGoldenParity("ai/tools", {
  blockDir,
  Component: Tools,
  variants: [
    {
      label: "billing · custom copy",
      props: {
        title: "Agent run",
        tools: [
          { name: "get_subscription", args: 'plan: "scale"', result: "active", duration: "96ms", icon: icon(CreditCard) },
          { name: "query_usage", args: 'period: "october"', result: "1.2M events", duration: "244ms", icon: icon(Database) },
          { name: "book_call", args: 'slot: "tue 14:00"', result: "confirmed", duration: "173ms", icon: icon(Calendar) },
        ],
      },
    },
    {
      label: "four tools · isometric",
      props: {
        isometric: true,
        title: "MCP tools",
        tools: [
          { name: "fetch_page", args: 'url: "docs/api"', result: "12kb", duration: "210ms", icon: icon(Globe) },
          { name: "read_schema", args: 'table: "orders"', result: "18 columns", duration: "64ms", icon: icon(Database) },
          { name: "open_pr", args: 'branch: "fix/tax"', result: "#312", duration: "418ms", icon: icon(GitBranch) },
          { name: "notify_team", args: 'channel: "#eng"', result: "posted", duration: "77ms", icon: icon(MessageSquare) },
        ],
      },
    },
  ],
});
