import { describe, it, expect } from "vitest";
import { parseRoute } from "../src/lib/router.js";
import { readTheme, readAppearance } from "../src/lib/theme.js";

describe("gallery routing", () => {
  it("parses home", () => {
    expect(parseRoute("/")).toEqual({ name: "home" });
    expect(parseRoute("/anything-else")).toEqual({ name: "home" });
  });

  it("parses block routes", () => {
    expect(parseRoute("/visuals/metrics/stat-card")).toEqual({
      name: "block",
      category: "metrics",
      file: "stat-card",
    });
  });
});

describe("gallery theme storage", () => {
  it("defaults to system/default", () => {
    expect(readAppearance()).toBe("system");
    expect(readTheme()).toBe("default");
  });
});
