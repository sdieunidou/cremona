import { describe, it, expect } from "vitest";
import {
  LAND_MASK_BASE64,
  LAND_MASK_HEIGHT,
  LAND_MASK_WIDTH,
  isLand,
  landMask,
} from "../src/land-mask.js";

describe("@cremona/core/land-mask", () => {
  it("decodes one bit per pixel of the 256×128 grid", () => {
    const mask = landMask();
    expect(mask.length).toBe((LAND_MASK_WIDTH * LAND_MASK_HEIGHT) / 8);
    expect(Array.from(mask)).toEqual(Array.from(Buffer.from(LAND_MASK_BASE64, "base64")));
    expect(landMask()).toBe(mask);
  });

  it("tells land from sea", () => {
    expect(isLand(48.86, 2.35)).toBe(true); // Paris
    expect(isLand(-23.55, -46.63)).toBe(true); // São Paulo
    expect(isLand(35.68, 139.69)).toBe(true); // Tokyo
    expect(isLand(30, -40)).toBe(false); // North Atlantic
    expect(isLand(-40, -120)).toBe(false); // South Pacific
  });

  it("clamps coordinates outside the grid to its edges", () => {
    expect(isLand(-95, 0)).toBe(isLand(-89.9, 0));
    expect(isLand(0, 200)).toBe(isLand(0, 179.9));
  });
});
