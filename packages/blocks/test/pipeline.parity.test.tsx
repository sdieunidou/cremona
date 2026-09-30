import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Bell, ChartColumn, Cloud, Globe, Mail, Smartphone, Workflow } from "lucide-react";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/connections/pipeline");

runGoldenParity("connections/pipeline", {
  blockDir,
  Component: Pipeline,
  variants: [
    {
      label: "2 in · 4 out",
      props: {
        // icon components are drawn at the node icon size
        inputs: [Globe, Smartphone],
        outputs: [ChartColumn, Mail, Bell, Cloud],
      },
    },
    {
      label: "isometric · 1 in · 2 out",
      props: { inputs: [Globe], outputs: [ChartColumn, Bell], isometric: true },
    },
    {
      label: "custom logo",
      props: { logo: <Workflow className="size-5 text-primary-foreground" strokeWidth={1.5} /> },
    },
  ],
});
