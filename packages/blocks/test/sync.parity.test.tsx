import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Cloud, Database, HardDrive, Laptop, Monitor, Server, Smartphone } from "lucide-react";
import { Sync } from "../src/connections/sync/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/sync");

// icon elements for the custom-pair variants (from the POC page chunk imports)
const icon = (Icon: typeof Cloud) => <Icon className="size-4" strokeWidth={2} />;

runGoldenParity("connections/sync", {
  blockDir,
  Component: Sync,
  variants: [
    { label: "single pair", props: { pairs: [[icon(Laptop), icon(Cloud)]] } },
    {
      label: "four pairs",
      props: {
        pairs: [
          [icon(Laptop), icon(Server)],
          [icon(Smartphone), icon(Cloud)],
          [icon(Monitor), icon(Database)],
          [icon(Database), icon(HardDrive)],
        ],
      },
    },
  ],
});
