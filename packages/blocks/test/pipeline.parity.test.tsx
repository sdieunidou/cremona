import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bell, ChartColumn, Cloud, Globe, Mail, Smartphone, Workflow } from "lucide-react";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/pipeline");

// icon elements for the custom variants (from the POC page chunk imports)
const icon = (Icon: typeof Globe) => <Icon className="size-4" strokeWidth={2} />;

runGoldenParity("connections/pipeline", {
  blockDir,
  Component: Pipeline,
  variants: [
    {
      label: "2 in · 4 out",
      props: {
        inputs: [icon(Globe), icon(Smartphone)],
        outputs: [icon(ChartColumn), icon(Mail), icon(Bell), icon(Cloud)],
      },
    },
    {
      label: "isometric · 1 in · 2 out",
      props: { inputs: [icon(Globe)], outputs: [icon(ChartColumn), icon(Bell)], isometric: true },
    },
    {
      label: "custom logo",
      props: { logo: <Workflow className="size-5 text-primary-foreground" strokeWidth={1.5} /> },
    },
  ],
});
