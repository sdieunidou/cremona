import "@testing-library/jest-dom/vitest";

// jsdom has no layout: Radix measures its controls with a ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
