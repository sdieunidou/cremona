import { describe, it, expect } from "vitest";
import { cn, gridCols, FRAME_HEIGHTS, RAINBOW_GRADIENT, ISO_VISIBLE } from "../src/index.js";

describe("@cremona/core", () => {
  it("cn merges truthy classes", () => {
    expect(cn("a", false, null, undefined, "b", "c")).toBe("a b c");
  });

  it("gridCols maps column counts (POC parity)", () => {
    expect(gridCols(1)).toBe("");
    expect(gridCols(2)).toBe("lg:grid-cols-2");
    expect(gridCols(3)).toBe("lg:grid-cols-2 xl:grid-cols-3");
    expect(gridCols(4)).toBe("lg:grid-cols-2 xl:grid-cols-4");
  });

  it("frame heights match the POC presets", () => {
    expect(FRAME_HEIGHTS.md).toBe("h-96");
    expect(FRAME_HEIGHTS.xl).toBe("h-[32rem]");
  });

  it("exports the shared visual constants", () => {
    expect(RAINBOW_GRADIENT).toContain("var(--color-violet-500)");
    expect(ISO_VISIBLE).toBe("rotateX(45deg) rotateZ(-45deg)");
  });
});
