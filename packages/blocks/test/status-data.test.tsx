import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HealthCheck } from "../src/status/health-check/react.js";
import { ResourceMonitor } from "../src/status/resource-monitor/react.js";
import { UptimeBar } from "../src/status/uptime-bar/react.js";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const polylines = (markup: string) =>
  [...markup.matchAll(/<polyline points="([^"]*)"/g)].map((m) => m[1]!);

describe("status/uptime-bar", () => {
  it("reports today's status, not the worst day of the window", () => {
    expect(html(<UptimeBar days={30} incidents={[3]} outages={[10]} />)).toContain(
      "All systems operational",
    );
    expect(html(<UptimeBar days={30} incidents={[3]} outages={[29]} />)).toContain("Major outage");
    expect(html(<UptimeBar days={30} incidents={[29]} outages={[]} />)).toContain(
      "Degraded performance",
    );
    expect(html(<UptimeBar days={30} outages={[10]} status="outage" />)).toContain("Major outage");
  });

  it("keeps the demo window's headline", () => {
    expect(html(<UptimeBar />)).toContain("Major outage");
  });

  it("counts each day once and only inside the window", () => {
    // day 2 is both degraded and down, day 40 is outside a 10-day window
    expect(html(<UptimeBar days={10} incidents={[2, 2, 40]} outages={[2]} />)).toContain("90.00%");
    expect(html(<UptimeBar days={0} incidents={[]} outages={[]} />)).not.toMatch(/NaN|Infinity/);
  });

  it("falls back on an unknown status instead of crashing", () => {
    const markup = html(
      <UptimeBar days={5} incidents={[]} outages={[]} status={"maintenance" as "outage"} />,
    );
    expect(markup).toContain("All systems operational");
  });
});

describe("status/health-check", () => {
  it("renders an unknown status as a neutral one, and a service without an icon", () => {
    const markup = html(
      <HealthCheck
        items={[
          {
            name: "Search",
            region: "eu-west-1",
            status: "maintenance" as "down",
            latency: "—",
          },
        ]}
      />,
    );
    expect(markup).toContain("Maintenance");
    expect(markup).toContain("lucide-server");
  });

  it("shows an empty state for no service", () => {
    const markup = html(<HealthCheck items={[]} />);
    expect(markup).toContain("No services");
    expect(markup).not.toContain("All systems normal");
  });
});

describe("status/resource-monitor", () => {
  it("draws the consumer's samples as they are, the reading on the last one", () => {
    const markup = html(
      <ResourceMonitor
        series={[{ label: "CPU", color: "var(--color-chart-2)", points: [0.1, 0.5, 0.73] }]}
      />,
    );
    expect(polylines(markup)).toEqual(["0.00,74.00 120.00,42.00 240.00,23.60"]);
    expect(markup).toContain("73%");
  });

  it("reads samples above 1 as percentages and drops missing ones", () => {
    const markup = html(
      <ResourceMonitor series={[{ label: "CPU", color: "red", points: [10, NaN, 50, 100] }]} />,
    );
    expect(polylines(markup)).toEqual(["0.00,74.00 120.00,42.00 240.00,2.00"]);
    expect(markup).toContain("100%");
    expect(markup).not.toContain("NaN");
  });

  it("shows an empty state when there is nothing to draw", () => {
    expect(html(<ResourceMonitor series={[]} />)).toContain("No data");
    const blank = html(<ResourceMonitor series={[{ label: "CPU", color: "red", points: [] }]} />);
    expect(blank).toContain("No data");
    expect(blank).toContain("—");
  });
});
