import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatCard } from "../src/metrics/stat-card/react.js";
import { Table } from "../src/data/table/react.js";
import { Gauge } from "../src/charts/gauge/react.js";
import { AgentFlow } from "../src/ai/agent-flow/react.js";

/** The preview frame, as it renders without `fill`. */
const FRAME = "relative isolate flex size-full items-center justify-center overflow-hidden px-2";
const FRAME_FILLED = "relative isolate flex size-full items-stretch justify-center overflow-hidden";

describe("fill", () => {
  it("leaves the preview frame alone by default", () => {
    expect(renderToStaticMarkup(<StatCard />)).toContain(FRAME);
    expect(renderToStaticMarkup(<StatCard />)).toContain("max-w-72");
  });

  it("drops the frame padding and stretches on the cross axis", () => {
    const html = renderToStaticMarkup(<StatCard fill />);
    expect(html).toContain(FRAME_FILLED);
    expect(html).not.toContain(FRAME);
  });

  it("removes the module cap — class-list form", () => {
    // metrics/stat-card caps at max-w-72 inside a cn() literal
    expect(renderToStaticMarkup(<StatCard />)).toContain("max-w-72");
    expect(renderToStaticMarkup(<StatCard fill />)).not.toContain("max-w-72");
  });

  it("removes the module cap — template-literal form", () => {
    // data/table builds its wrapper with a template literal and a trailing
    // interpolation; the cap has to come out without disturbing the rest.
    expect(renderToStaticMarkup(<Table />)).toContain("max-w-96");
    expect(renderToStaticMarkup(<Table fill />)).not.toContain("max-w-96");
  });

  it("keeps inner caps that are content, not the module", () => {
    // charts/gauge caps the module at max-w-80 and its arc at max-w-56.
    // Only the module one is a layout concern.
    const filled = renderToStaticMarkup(<Gauge fill />);
    expect(filled).not.toContain("max-w-80");
    expect(filled).toContain("max-w-56");
  });

  it("still drops the padding on a block that has no cap", () => {
    expect(renderToStaticMarkup(<AgentFlow />)).toContain("px-2");
    expect(renderToStaticMarkup(<AgentFlow fill />)).toContain(FRAME_FILLED);
  });
});
