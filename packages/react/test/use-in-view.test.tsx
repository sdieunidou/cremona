import { afterEach, describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useInView, observeInView } from "../src/index.js";

interface Geometry {
  /** target size (px) */
  box: { width: number; height: number };
  /** visible share of the target */
  ratio: number;
}

/** Viewport the mock reports as the root bounds. */
const ROOT = { width: 1280, height: 900 };

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  /** when set, observe() reports nothing and tests call emit() */
  static manual = false;
  cb: IntersectionObserverCallback;
  thresholds: number[];
  targets: Element[] = [];
  constructor(cb: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.cb = cb;
    const t = options.threshold ?? 0;
    this.thresholds = Array.isArray(t) ? t : [t];
    MockIntersectionObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.push(target);
    // immediately report intersecting
    if (!MockIntersectionObserver.manual)
      this.cb(
        [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
  /** Report the target at a visible share, as a browser does when it crosses a threshold. */
  emit({ box, ratio }: Geometry) {
    const entry = {
      target: this.targets[0],
      isIntersecting: ratio > 0,
      intersectionRatio: ratio,
      boundingClientRect: { x: 0, y: 0, top: 0, left: 0, ...box },
      rootBounds: { x: 0, y: 0, top: 0, left: 0, ...ROOT },
    } as unknown as IntersectionObserverEntry;
    this.cb([entry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

afterEach(() => {
  MockIntersectionObserver.instances = [];
  MockIntersectionObserver.manual = false;
});

function observed(amount: number) {
  MockIntersectionObserver.manual = true;
  const hook = renderHook(() => {
    const ref = useRef<HTMLDivElement>(document.createElement("div"));
    return useInView(ref, { amount });
  });
  const io = MockIntersectionObserver.instances.at(-1)!;
  const emit = (geometry: Geometry) => act(() => io.emit(geometry));
  return { hook, io, emit };
}

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

  it("enters once the requested share of the element is visible", () => {
    const { hook, emit } = observed(0.5);
    const box = { width: 400, height: 300 };
    emit({ box, ratio: 0.3 });
    expect(hook.result.current).toBe(false);
    emit({ box, ratio: 0.5 });
    expect(hook.result.current).toBe(true);
    emit({ box, ratio: 0.2 });
    expect(hook.result.current).toBe(false);
  });

  it("caps the share at what an element taller than the viewport can show", () => {
    // 2200px tall in a 900px viewport: at most 900 / 2200 ≈ 0.41 of it is ever visible
    const { hook, io, emit } = observed(0.5);
    const box = { width: 400, height: 2200 };
    const max = ROOT.height / box.height;
    // the observer is told about a threshold the element can actually cross
    expect(io.thresholds.some((t) => t > 0.3 && t <= max)).toBe(true);
    emit({ box, ratio: 0.2 });
    expect(hook.result.current).toBe(false);
    emit({ box, ratio: max });
    expect(hook.result.current).toBe(true);
    emit({ box, ratio: 0 });
    expect(hook.result.current).toBe(false);
  });

  it("keeps any intersection as the trigger for amount 0", () => {
    const { hook, emit } = observed(0);
    emit({ box: { width: 400, height: 5000 }, ratio: 0.01 });
    expect(hook.result.current).toBe(true);
  });
});
