import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Cloud, Database, HardDrive, Laptop, Monitor, Server, Smartphone } from "lucide-react";
import { Sync } from "../src/connections/sync/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/sync");

runGoldenParity("connections/sync", {
  blockDir,
  Component: Sync,
  variants: [
    // icon components are drawn at the node icon size
    { label: "single pair", props: { pairs: [[Laptop, Cloud]] } },
    {
      label: "four pairs",
      props: {
        pairs: [
          [Laptop, Server],
          [Smartphone, Cloud],
          [Monitor, Database],
          [Database, HardDrive],
        ],
      },
    },
  ],
});
