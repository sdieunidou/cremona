import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Sparkline } from "../src/charts/sparkline/react.js";
import { Donut } from "../src/charts/donut/react.js";

/** The tray the data blocks share. */
const TRAY = "rounded-3xl border border-border/50 bg-muted/75 p-1.5";

describe("charts/sparkline framed", () => {
  it("is flat by default", () => {
    const html = renderToStaticMarkup(<Sparkline />);
    expect(html).not.toContain("bg-muted/75");
    expect(html).toContain("rounded-xl border bg-card");
  });

  it("wears the same tray as the other data blocks when framed", () => {
    const sparkline = renderToStaticMarkup(<Sparkline framed />);
    const donut = renderToStaticMarkup(<Donut />);
    expect(sparkline).toContain(TRAY);
    expect(donut).toContain(TRAY);
    // and the inner card lines up on the same radius
    expect(sparkline).toContain("rounded-2xl");
  });

  it("moves the glow onto the tray when framed", () => {
    const framed = renderToStaticMarkup(<Sparkline framed />);
    // tray geometry, the one charts/donut and charts/gauge use
    expect(framed).toContain("inset-x-1.25 bottom-0 h-20");
    expect(framed).toContain("rounded-b-3xl bg-background/75");
  });

  it("keeps the flat card byte-identical to before the prop existed", () => {
    // `framed` defaults to false, so the golden-backed render must not move.
    expect(renderToStaticMarkup(<Sparkline />)).toBe(
      renderToStaticMarkup(<Sparkline framed={false} />),
    );
  });
});
