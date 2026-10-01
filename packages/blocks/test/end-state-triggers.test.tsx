/**
 * `trigger="inView"` and `"inViewRepeat"` reach the end that `"mount"` reaches — the static
 * render — once in view, and `"inViewRepeat"` again after leaving the viewport and coming back.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  cleanup,
  endStateDiffs,
  format,
  installEndStateEnvironment,
  loadBlock,
  restoreEndStateEnvironment,
  setInView,
  settle,
} from "./helpers/end-state.js";

// end states that depend on what the trigger did: connectors swapped once drawn, a reveal
// mask dropped once revealed, a step cycle at rest, buttons handing opacity back to :hover,
// an imperative upload sequence, a dashed line drawn on
const SPOT = [
  "search/semantic",
  "geo/world-map",
  "ai/agent-flow",
  "payments/checkout",
  "files/upload",
  "charts/line",
];

beforeAll(installEndStateEnvironment);
afterEach(cleanup);
afterAll(restoreEndStateEnvironment);

describe.each(SPOT)("%s", (key) => {
  it.each(["inView", "inViewRepeat"])("trigger=%s ends like the static render", async (trigger) => {
    const { Component, labels, props } = await loadBlock(key);
    const { diffs, settled } = await endStateDiffs(Component, props(labels[0]!), {
      animated: true,
      trigger,
    });
    expect(settled).toBe(true);
    expect(diffs, format(diffs)).toEqual([]);
  });

  it("trigger=inViewRepeat ends there again after leaving the viewport", async () => {
    const { Component, labels, props } = await loadBlock(key);
    const { diffs } = await endStateDiffs(
      Component,
      props(labels[0]!),
      { animated: true, trigger: "inViewRepeat" },
      async (host) => {
        await setInView(false);
        await settle(host);
        await setInView(true);
        await settle(host);
      },
    );
    expect(diffs, format(diffs)).toEqual([]);
  });
});
