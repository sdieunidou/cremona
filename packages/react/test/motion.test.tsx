import { afterEach, describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useLoopActive, usePrefersReducedMotion } from "../src/index.js";

let intersect: ((isIntersecting: boolean) => void) | null = null;
class MockIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    intersect = (isIntersecting) =>
      cb(
        [{ isIntersecting } as unknown as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
  observe() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

function mockReducedMotion(reduce: boolean) {
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

function useLoop(enabled = true) {
  const ref = useRef<HTMLDivElement>(document.createElement("div"));
  return useLoopActive(ref, enabled);
}

afterEach(() => {
  vi.restoreAllMocks();
  intersect = null;
});

describe("useLoopActive", () => {
  it("is active on the server, so looping markup is server-rendered", () => {
    function Probe() {
      return <span>{String(useLoop())}</span>;
    }
    expect(renderToStaticMarkup(<Probe />)).toBe("<span>true</span>");
  });

  it("pauses when the element leaves the viewport and resumes when it returns", () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useLoop());
    expect(result.current).toBe(true);
    act(() => intersect?.(false));
    expect(result.current).toBe(false);
    act(() => intersect?.(true));
    expect(result.current).toBe(true);
  });

  it("stays off under reduced motion or when disabled", () => {
    mockReducedMotion(true);
    expect(renderHook(() => useLoop()).result.current).toBe(false);
    vi.restoreAllMocks();
    mockReducedMotion(false);
    expect(renderHook(() => useLoop(false)).result.current).toBe(false);
  });

  it("pauses while the page is hidden", () => {
    mockReducedMotion(false);
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    expect(renderHook(() => useLoop()).result.current).toBe(false);
    visibility.mockRestore();
  });
});

describe("usePrefersReducedMotion", () => {
  it("reads the media query on the client and is false on the server", () => {
    mockReducedMotion(true);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true);
    function Probe() {
      return <span>{String(usePrefersReducedMotion())}</span>;
    }
    expect(renderToStaticMarkup(<Probe />)).toBe("<span>false</span>");
  });
});
