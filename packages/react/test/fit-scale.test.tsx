import { afterEach, describe, it, expect, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { useFitScale } from "../src/index.js";

let resize: (() => void) | null = null;
const disconnect = vi.fn();
class MockResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    resize = () => cb([], this as unknown as ResizeObserver);
  }
  observe() {}
  disconnect = disconnect;
}
vi.stubGlobal("ResizeObserver", MockResizeObserver);

function size(el: HTMLElement, props: Record<string, number>) {
  for (const [key, value] of Object.entries(props))
    Object.defineProperty(el, key, { configurable: true, value });
}

function Fit({ layout }: { layout?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useFitScale(frame, stage, layout);
  return (
    <div ref={frame} data-testid="frame" style={{ padding: "10px" }}>
      <div ref={stage} data-testid="stage" />
    </div>
  );
}

afterEach(() => {
  resize = null;
  disconnect.mockClear();
});

describe("useFitScale", () => {
  it("scales the stage down to the frame's content box, never up", () => {
    const { getByTestId } = render(<Fit />);
    const frame = getByTestId("frame");
    const stage = getByTestId("stage");
    size(stage, { offsetWidth: 400, offsetHeight: 200 });

    size(frame, { clientWidth: 220, clientHeight: 400 });
    act(() => resize!());
    expect(stage.style.scale).toBe("0.5");

    size(frame, { clientWidth: 820, clientHeight: 620 });
    act(() => resize!());
    expect(stage.style.scale).toBe("");
  });

  it("stops observing and clears the scale on unmount", () => {
    const { getByTestId, unmount } = render(<Fit />);
    const stage = getByTestId("stage");
    size(stage, { offsetWidth: 400, offsetHeight: 200 });
    size(getByTestId("frame"), { clientWidth: 220, clientHeight: 400 });
    act(() => resize!());
    expect(stage.style.scale).toBe("0.5");
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(stage.style.scale).toBe("");
  });
});
