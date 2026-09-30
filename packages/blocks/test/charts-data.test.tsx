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

type Props = Record<string, unknown>;
const render = (C: ComponentType<Props>, props: Props) => renderToStaticMarkup(<C {...props} />);
const BROKEN = /NaN|Infinity|undefined/;

/** Inputs a live dataset produces: empty, one value, gaps, zeros, negatives, huge counts. */
const hostile: [string, ComponentType<Props>, Props][] = [
  ["line []", Line, { points: [] }],
  ["line values []", Line, { values: [] }],
  ["line one point", Line, { points: [0.5] }],
  ["line gaps", Line, { points: [NaN, 0.2, Infinity, 0.6, NaN] }],
  ["line raw", Line, { values: [120, 340, 560] }],
  ["line flat", Line, { values: [5, 5, 5] }],
  ["sparkline []", Sparkline, { points: [] }],
  ["sparkline gaps", Sparkline, { points: [0.3, NaN, 0.6] }],
  ["bar []", Bar, { items: [] }],
  [
    "bar zeros",
    Bar,
    {
      items: [
        { label: "A", value: 0 },
        { label: "B", value: 0 },
      ],
    },
  ],
  [
    "bar negatives",
    Bar,
    {
      items: [
        { label: "A", value: -20 },
        { label: "B", value: 30 },
      ],
    },
  ],
  [
    "bar NaN",
    Bar,
    {
      items: [
        { label: "A", value: NaN },
        { label: "B", value: Infinity },
      ],
    },
  ],
  ["donut []", Donut, { segments: [] }],
  [
    "donut zeros",
    Donut,
    {
      segments: [
        { label: "A", value: 0 },
        { label: "B", value: 0 },
      ],
    },
  ],
  [
    "donut NaN",
    Donut,
    {
      segments: [
        { label: "A", value: NaN },
        { label: "B", value: 2 },
      ],
    },
  ],
  ["funnel []", Funnel, { stages: [] }],
  [
    "funnel first 0",
    Funnel,
    {
      stages: [
        { label: "A", value: 0 },
        { label: "B", value: 4 },
      ],
    },
  ],
  [
    "funnel NaN",
    Funnel,
    {
      stages: [
        { label: "A", value: 10 },
        { label: "B", value: NaN },
      ],
    },
  ],
  ["gauge NaN", Gauge, { percent: NaN }],
  ["gauge NaN zone", Gauge, { zones: [{ to: NaN, className: "text-red-300" }] }],
  ["heatmap []", Heatmap, { rows: [], columns: [] }],
  ["heatmap NaN", Heatmap, { rows: [{ label: "A", values: [1, NaN, Infinity, 4] }] }],
];

describe("charts with real data", () => {
  it.each(hostile)("%s renders without a crash or a broken value", (_, C, props) => {
    for (const animated of [false, true]) {
      const html = render(C, { ...props, animated });
      expect(html.replace(/aria-hidden="true"/g, "")).not.toMatch(BROKEN);
    }
  });

  it("shows an empty state instead of demo data", () => {
    expect(render(Line, { points: [] })).toContain("No data");
    expect(render(Bar, { items: [], emptyLabel: "Aucune donnée" })).toContain("Aucune donnée");
    expect(render(Donut, { segments: [] })).toContain("No data");
    expect(render(Funnel, { stages: [] })).toContain("No data");
    expect(render(Heatmap, { rows: [] })).toContain("No data");
    expect(render(Sparkline, { points: [] })).toContain("No data");
  });

  it("scales raw values like fractions of their own range", () => {
    const fractions = [0.2, 0.5, 0.35, 1];
    expect(render(Line, { values: fractions, min: 0, max: 1 })).toBe(
      render(Line, { points: fractions }),
    );
    expect(render(Line, { values: [40, 100, 70, 200], min: 0, max: 200 })).toBe(
      render(Line, { points: fractions }),
    );
    // raw values given as `points` are scaled rather than drawn off the plot
    expect(render(Sparkline, { points: [120, 300, 210, 480] })).toBe(
      render(Sparkline, { values: [120, 300, 210, 480] }),
    );
  });

  it("keeps every bar inside the plot, negatives included", () => {
    const html = render(Bar, {
      items: [
        { label: "A", value: -20 },
        { label: "B", value: 10 },
        { label: "C", value: 30 },
      ],
    });
    const tops = [...html.matchAll(/top:(-?[\d.]+)%;height:([\d.]+)%/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(tops).toHaveLength(3);
    for (const [top, height] of tops) {
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top! + height!).toBeLessThanOrEqual(100.0001);
    }
  });

  it("gives every bar a width and thins the labels when there are many", () => {
    const items = Array.from({ length: 200 }, (_, i) => ({ label: String(i + 1), value: i % 7 }));
    const html = render(Bar, { items });
    expect(html).toContain("gap-0");
    const labels = [...html.matchAll(/tabular-nums[^"]*">(\d+)</g)];
    expect(labels.length).toBeGreaterThan(1);
    expect(labels.length).toBeLessThanOrEqual(12);
  });

  it("never reads a missing gauge value as a full arc", () => {
    const html = render(Gauge, { percent: NaN });
    expect(html).toContain("—");
    expect(html).not.toContain("stroke-dasharray");
    expect(render(Gauge, { percent: 150 })).toContain(">150<");
  });

  it("draws a heatmap with a missing cell instead of blanking it", () => {
    const html = render(Heatmap, {
      rows: [{ label: "A", values: [1, NaN, 2, 4] }],
      columns: ["a", "b", "c", "d"],
    });
    expect(html.match(/background-color:transparent/g)).toHaveLength(1);
    expect(html).toContain("color-mix(in oklab, var(--color-primary) 100%, transparent)");
  });

  it("treats a donut with nothing to share as an empty ring", () => {
    const html = render(Donut, {
      segments: [
        { label: "A", value: 0 },
        { label: "B", value: -3 },
      ],
    });
    expect(html).toContain('stroke="var(--color-muted)"');
    expect(html.match(/>0%</g)).toHaveLength(2);
  });

  it("colours segments that come without one from the chart palette", () => {
    const html = render(Donut, { segments: [{ label: "A", value: 1 }] });
    expect(html).toContain("var(--color-chart-1)");
  });

  it("keeps percentages honest when the first funnel stage is empty", () => {
    const html = render(Funnel, {
      stages: [
        { label: "A", value: 0 },
        { label: "B", value: 40 },
      ],
    });
    // the headline and both conversion rates, instead of "4000%"
    expect(html.match(/>—</g)).toHaveLength(3);
    expect(render(Funnel, { stages: [{ label: "A", value: 1_234_567_890 }] })).toContain("1.2B");
  });
});
