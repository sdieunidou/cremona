import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bell, ChartLine, Cog, Laptop, Send, Server, Shuffle, Smartphone } from "lucide-react";
import { Flow } from "../src/connections/flow/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/flow");

runGoldenParity("connections/flow", {
  blockDir,
  Component: Flow,
  variants: [
    {
      label: "custom icons",
      props: {
        // icon components are drawn at the node icon size; the transforms keep elements
        // because the POC colours their icons explicitly
        sources: [Smartphone, Laptop, Server],
        transforms: [
          <Cog className="size-4.5 text-primary-foreground" strokeWidth={1.5} />,
          <Shuffle className="size-4.5 text-primary-foreground" strokeWidth={1.5} />,
        ],
        destinations: [ChartLine, Send, Bell],
      },
    },
  ],
});
