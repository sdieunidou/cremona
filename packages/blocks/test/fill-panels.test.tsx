/**
 * `fill` contract for the data blocks: a card wrapper becomes `h-full flex flex-col`
 * with a `flex-1` card, so side-by-side panels share one bottom edge; a fixed-aspect
 * stage is centred and capped at the panel width instead of being stretched.
 */
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";
import { Bar } from "../src/charts/bar/react.js";
import { Donut } from "../src/charts/donut/react.js";
import { Funnel } from "../src/charts/funnel/react.js";
import { Gauge } from "../src/charts/gauge/react.js";
import { Heatmap } from "../src/charts/heatmap/react.js";
import { Line } from "../src/charts/line/react.js";
import { Sparkline } from "../src/charts/sparkline/react.js";
import { Converge } from "../src/connections/converge/react.js";
import { Flow } from "../src/connections/flow/react.js";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { Sync } from "../src/connections/sync/react.js";
import { MiniPanel } from "../src/dashboard/mini-panel/react.js";
import { WidgetGrid } from "../src/dashboard/widget-grid/react.js";
import { Filters } from "../src/data/filters/react.js";
import { Import } from "../src/data/import/react.js";
import { Query } from "../src/data/query/react.js";
import { Table } from "../src/data/table/react.js";
import { Comparison } from "../src/metrics/comparison/react.js";
import { StatCard } from "../src/metrics/stat-card/react.js";
import { Trend } from "../src/metrics/trend/react.js";
import { Checkout } from "../src/payments/checkout/react.js";
import { CreditCard } from "../src/payments/credit-card/react.js";
import { UsageMeter } from "../src/payments/usage-meter/react.js";
import { HealthCheck } from "../src/status/health-check/react.js";
import { ResourceMonitor } from "../src/status/resource-monitor/react.js";
import { UptimeBar } from "../src/status/uptime-bar/react.js";

type Block = ComponentType<Record<string, unknown>>;

const CARDS: [string, Block][] = [
  ["charts/bar", Bar],
  ["charts/donut", Donut],
  ["charts/funnel", Funnel],
  ["charts/gauge", Gauge],
  ["charts/heatmap", Heatmap],
  ["charts/line", Line],
  ["charts/sparkline", Sparkline],
  ["dashboard/mini-panel", MiniPanel],
  ["dashboard/widget-grid", WidgetGrid],
  ["data/filters", Filters],
  ["data/import", Import],
  ["data/query", Query],
  ["data/table", Table],
  ["metrics/comparison", Comparison],
  ["metrics/stat-card", StatCard],
  ["metrics/trend", Trend],
  ["payments/checkout", Checkout],
  ["payments/usage-meter", UsageMeter],
  ["status/health-check", HealthCheck],
  ["status/resource-monitor", ResourceMonitor],
  ["status/uptime-bar", UptimeBar],
];

const STAGES: [string, Block][] = [
  ["connections/converge", Converge],
  ["connections/flow", Flow],
  ["connections/pipeline", Pipeline],
  ["connections/sync", Sync],
  ["payments/credit-card", CreditCard],
];

/** Class lists of the frame's first child (the wrapper) and of every element. */
function classes(C: Block, props: Record<string, unknown>) {
  const html = renderToStaticMarkup(<C {...props} />);
  const all = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]!.split(/\s+/));
  return { wrapper: all[1]!, all };
}

describe("fill", () => {
  it.each(CARDS)("%s: the wrapper is a full-height column and a card grows in it", (_, C) => {
    for (const props of [{ fill: true }, { fill: true, animated: true }]) {
      const { wrapper, all } = classes(C, props);
      expect(wrapper).toEqual(expect.arrayContaining(["flex", "h-full", "flex-col"]));
      expect(all.slice(2).some((list) => list.includes("flex-1"))).toBe(true);
    }
  });

  it.each(CARDS)("%s: without fill, nothing stretches", (_, C) => {
    const { wrapper } = classes(C, {});
    expect(wrapper).not.toContain("h-full");
  });

  it.each(STAGES)("%s: a fixed-aspect stage is centred, never stretched", (_, C) => {
    const { wrapper } = classes(C, { fill: true });
    expect(wrapper).toEqual(expect.arrayContaining(["self-center", "max-w-full"]));
    expect(wrapper).not.toContain("h-full");
  });
});
