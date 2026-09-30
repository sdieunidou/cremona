/** Looping animations run only while useLoopActive allows it: in view, page visible, motion allowed. */
import { afterEach, describe, it, expect, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { Converge } from "../src/connections/converge/react.js";
import { Flow } from "../src/connections/flow/react.js";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { Sync } from "../src/connections/sync/react.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const observers = new Set<MockIntersectionObserver>();
class MockIntersectionObserver {
  targets: Element[] = [];
  constructor(private cb: IntersectionObserverCallback) {
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    observers.delete(this);
  }
  fire(isIntersecting: boolean) {
    this.cb(
      this.targets.map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    );
  }
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

function setIntersecting(isIntersecting: boolean) {
  act(() => [...observers].forEach((o) => o.fire(isIntersecting)));
}

function reducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );
}

function mount(element: ReactElement) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(element));
  return {
    html: () => host.innerHTML,
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  observers.clear();
});

const SMIL: [string, ReactElement, ReactElement][] = [
  ["converge", <Converge animated trigger="mount" />, <Converge />],
  ["flow", <Flow animated trigger="mount" />, <Flow />],
  ["pipeline", <Pipeline animated trigger="mount" />, <Pipeline />],
  ["sync", <Sync animated trigger="mount" />, <Sync />],
];

describe("connections pulses", () => {
  it.each(SMIL)("%s: server markup keeps its pulses, the static render has none", (_, on, off) => {
    expect(renderToStaticMarkup(on)).toContain("<animateMotion");
    expect(renderToStaticMarkup(off)).not.toContain("<animateMotion");
  });

  it.each(SMIL)("%s: pulses stop off-screen and come back in view", (_, on) => {
    reducedMotion(false);
    const view = mount(on);
    expect(view.html()).toContain("<animateMotion");
    setIntersecting(false);
    expect(view.html()).not.toContain("<animateMotion");
    setIntersecting(true);
    expect(view.html()).toContain("<animateMotion");
    view.unmount();
  });

  it.each(SMIL)("%s: no pulse for users who ask for reduced motion", (_, on) => {
    reducedMotion(true);
    const view = mount(on);
    expect(view.html()).not.toContain("<animateMotion");
    view.unmount();
  });
});
