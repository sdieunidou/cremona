import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Bell,
  ChartLine,
  Cog,
  Laptop,
  Send,
  Server,
  Shuffle,
  Smartphone,
} from "lucide-react";
import { Flow } from "../src/connections/flow/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/flow");

// icon elements for the custom-icons variant (from the POC page chunk imports)
const icon = (Icon: typeof Bell, className = "size-4") => <Icon className={className} strokeWidth={2} />;

runGoldenParity("connections/flow", {
  blockDir,
  Component: Flow,
  variants: [
    {
      label: "custom icons",
      props: {
        sources: [icon(Smartphone), icon(Laptop), icon(Server)],
        transforms: [
          <Cog className="size-4.5 text-primary-foreground" strokeWidth={1.5} />,
          <Shuffle className="size-4.5 text-primary-foreground" strokeWidth={1.5} />,
        ],
        destinations: [icon(ChartLine), icon(Send), icon(Bell)],
      },
    },
  ],
});
