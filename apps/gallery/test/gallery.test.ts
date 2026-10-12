import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import { parseRoute } from "../src/lib/router.js";
import { readTheme, readAppearance, THEMES } from "../src/lib/theme.js";
import themes from "../../../packages/tokens/themes.json";

describe("gallery routing", () => {
  it("parses home", () => {
    expect(parseRoute("/")).toEqual({ name: "home" });
  });

  it("parses block routes", () => {
    expect(parseRoute("/visuals/metrics/stat-card")).toEqual({
      name: "block",
      category: "metrics",
      file: "stat-card",
    });
    expect(parseRoute("/visuals/metrics/stat-card/")).toMatchObject({ name: "block" });
  });

  it("parses the component routes", () => {
    expect(parseRoute("/components")).toEqual({ name: "components" });
    expect(parseRoute("/components/")).toEqual({ name: "components" });
    expect(parseRoute("/components/dropdown-menu")).toEqual({
      name: "component",
      component: "dropdown-menu",
    });
    expect(parseRoute("/components/a/b")).toEqual({ name: "not-found" });
  });

  it("sends every other path to the not-found page", () => {
    for (const path of ["/anything-else", "/visuals/metrics", "/visuals/a/b/c", "/nope/404"])
      expect(parseRoute(path), path).toEqual({ name: "not-found" });
  });
});

describe("gallery theme storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("defaults to system/default", () => {
    expect(readAppearance()).toBe("system");
    expect(readTheme()).toBe("default");
  });

  it("ignores unknown stored values", () => {
    localStorage.setItem("cremona-appearance", "sepia");
    localStorage.setItem("cremona-theme", "ocean");
    expect(readAppearance()).toBe("system");
    expect(readTheme()).toBe("default");
  });

  it("falls back to the defaults when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readAppearance()).toBe("system");
    expect(readTheme()).toBe("default");
  });

  it("offers exactly the themes of @cremona/tokens", () => {
    expect(THEMES).toEqual(themes);
  });

  it("compiles the tokens of every theme it offers", () => {
    // tailwind.css brings the default theme only: each other one is its own file
    const css = readFileSync(join(__dirname, "..", "src", "gallery.css"), "utf8");
    const imported = [...css.matchAll(/@import "@cremona\/tokens\/css\/themes\/([\w-]+)\.css";/g)];
    expect(imported.map((m) => m[1])).toEqual(
      themes.filter((t) => t.value !== "default").map((t) => t.value),
    );
  });
});
