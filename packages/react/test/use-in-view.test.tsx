import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useInView, observeInView } from "../src/index.js";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    MockIntersectionObserver.instances.push(this);
  }
  observe(target: Element) {
    // immediately report intersecting
    this.cb(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

describe("useInView", () => {
  it("flips true when the element intersects", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement("div"));
      return useInView(ref, { once: true });
    });
    expect(result.current).toBe(true);
  });

  it("observeInView invokes the callback and returns a stopper", () => {
    const seen: Element[] = [];
    const stop = observeInView([document.createElement("div")], (el) => {
      seen.push(el);
    });
    expect(seen.length).toBe(1);
    expect(typeof stop).toBe("function");
    stop();
  });
});
