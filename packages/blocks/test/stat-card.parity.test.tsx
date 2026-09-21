import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StatCard } from "../src/metrics/stat-card/react.js";
import { ShoppingCart, Users, Activity, Target } from "lucide-react";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/metrics/stat-card",
);

// icon identity for the custom-copy variants (from the POC page chunk imports)
const icons = { Users, ShoppingCart: ShoppingCart, Activity, Target };

runGoldenParity("metrics/stat-card", {
  blockDir,
  Component: StatCard,
  variants: [
    { label: "users · custom copy", props: { icon: Users, label: "Active Users", value: "12,481", change: "+8.1%", period: "vs last week", trend: "up" } },
    { label: "orders · custom copy", props: { icon: ShoppingCart, label: "Orders", value: "1,284", change: "-3.2%", period: "vs last month", trend: "down" } },
    { label: "pageviews · custom copy", props: { icon: Activity, label: "Page Views", value: "92,418", change: "+24.7%", period: "vs last 7d", trend: "up" } },
    { label: "conversion · custom copy", props: { icon: Target, label: "Conversion", value: "4.82%", change: "+0.6pt", period: "vs last 30d", trend: "up" } },
  ],
});
