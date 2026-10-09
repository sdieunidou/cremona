import { describe, it, expect } from "vitest";
import {
  cn,
  gridCols,
  toFractions,
  FRAME_HEIGHTS,
  RAINBOW_GRADIENT,
  ISO_VISIBLE,
} from "../src/index.js";

describe("@cremona/core", () => {
  it("cn merges truthy classes", () => {
    expect(cn("a", false, null, undefined, "b", "c")).toBe("a b c");
  });

  it("gridCols maps column counts", () => {
    expect(gridCols(1)).toBe("");
    expect(gridCols(2)).toBe("lg:grid-cols-2");
    expect(gridCols(3)).toBe("lg:grid-cols-2 xl:grid-cols-3");
    expect(gridCols(4)).toBe("lg:grid-cols-2 xl:grid-cols-4");
  });

  it("frame heights are the five size presets", () => {
    expect(FRAME_HEIGHTS.md).toBe("h-96");
    expect(FRAME_HEIGHTS.xl).toBe("h-[32rem]");
  });

  it("toFractions keeps 0..1 points and scales everything else", () => {
    expect(toFractions([0, 0.5, 1])).toEqual([0, 0.5, 1]);
    expect(toFractions([10, 20, 30])).toEqual([0, 0.5, 1]);
    expect(toFractions([], [100, 150, 200])).toEqual([0, 0.5, 1]);
    expect(toFractions([], [50, 150], 0, 100)).toEqual([0.5, 1]);
    expect(toFractions([0.2, 0.4], undefined, 0, 0.8)).toEqual([0.25, 0.5]);
  });

  it("toFractions leaves gaps for missing values and centres a flat series", () => {
    expect(toFractions([], [3, Number.NaN, 5])).toEqual([0, null, 1]);
    expect(toFractions([], [7, 7, 7])).toEqual([0.5, 0.5, 0.5]);
    expect(toFractions([], [Number.NaN])).toEqual([null]);
  });

  it("exports the shared visual constants", () => {
    expect(RAINBOW_GRADIENT).toContain("var(--color-violet-500)");
    expect(ISO_VISIBLE).toBe("rotateX(45deg) rotateZ(-45deg)");
  });
});
