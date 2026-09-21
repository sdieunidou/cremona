import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Cloud, Cpu, Database, Globe, Server } from "lucide-react";
import { Logs } from "../src/api/logs/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/api/logs");

// icon elements for the custom-sources variants (from the POC page chunk imports)
const icon = (Icon: typeof Globe) => <Icon className="size-3.5" strokeWidth={2} />;

runGoldenParity("api/logs", {
  blockDir,
  Component: Logs,
  variants: [
    { label: "two sources", props: { sources: [icon(Globe), icon(Database)] } },
    { label: "four sources", props: { sources: [icon(Globe), icon(Server), icon(Cpu), icon(Cloud)] } },
  ],
});
