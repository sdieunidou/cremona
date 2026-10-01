import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UptimeBar } from "../src/status/uptime-bar/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/status/uptime-bar");

runGoldenParity("status/uptime-bar", {
  blockDir,
  Component: UptimeBar,
  variants: [
    // The POC headlined the worst day of the window; the block reports the last day
    // (here operational), so this variant states the status its golden shows.
    {
      label: "30 days · incident",
      props: { days: 30, incidents: [7, 8, 19], outages: [14], status: "outage" },
    },
  ],
});
