import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Gauge } from "../src/charts/gauge/react.js";

/** The three zone bands, in order, as rendered markup. */
function bands(markup: string): string[] {
  return [...markup.matchAll(/<path[^>]*opacity-30[^>]*>/g)].map((m) => m[0]);
}

describe("charts/gauge zones", () => {
  it("applies className to the band", () => {
    const html = renderToStaticMarkup(
      <Gauge percent={50} zones={[{ to: 100, className: "text-emerald-300" }]} />,
    );
    expect(bands(html)[0]).toContain("text-emerald-300");
  });

  it("still accepts the deprecated color field as a class", () => {
    const withColor = renderToStaticMarkup(
      <Gauge percent={50} zones={[{ to: 100, color: "text-amber-300" }]} />,
    );
    const withClassName = renderToStaticMarkup(
      <Gauge percent={50} zones={[{ to: 100, className: "text-amber-300" }]} />,
    );
    expect(withColor).toBe(withClassName);
  });

  it("paints a CSS colour as a stroke instead of dropping it", () => {
    // `color` reads like a CSS value, so callers pass one. Rendering an
    // unstyled band for it is a silent failure.
    const band = bands(
      renderToStaticMarkup(
        <Gauge percent={50} zones={[{ to: 100, color: "var(--color-red-500)" }]} />,
      ),
    )[0]!;
    expect(band).toContain("stroke:var(--color-red-500)");
    // and not glued onto the class list, where it would do nothing
    expect(/class="([^"]*)"/.exec(band)?.[1]).toBe("opacity-30");
  });

  it("keeps the band count and order", () => {
    const html = renderToStaticMarkup(
      <Gauge
        percent={76}
        zones={[
          { to: 40, className: "text-red-300" },
          { to: 70, className: "text-amber-300" },
          { to: 100, className: "text-emerald-300" },
        ]}
      />,
    );
    const rendered = bands(html);
    expect(rendered).toHaveLength(3);
    expect(rendered[0]).toContain("text-red-300");
    expect(rendered[2]).toContain("text-emerald-300");
  });
});
