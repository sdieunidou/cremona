import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { App } from "../src/app.js";
import { stats, blocks } from "../src/lib/discovery.js";

describe("gallery app", () => {
  it("discovers all 115 ported blocks", () => {
    expect(stats.blocks).toBe(115);
    expect(stats.ported).toBe(115);
    expect(Object.keys(blocks).length).toBe(115);
  });

  it("renders the home grid with categories", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);
    expect(screen.getByText("All visual compositions")).toBeTruthy();
    // category appears in the sidebar and as a section heading
    expect(screen.getAllByText("Metrics").length).toBeGreaterThanOrEqual(2);
    cleanup();
  });

  it("renders a block page with all its variants", () => {
    window.history.replaceState({}, "", "/visuals/metrics/stat-card");
    render(<App />);
    // title in sidebar + page heading
    expect(screen.getAllByText("Stat Card").length).toBeGreaterThanOrEqual(2);
    // the 6 core variants' labels appear in preview footers
    expect(screen.getAllByText("default").length).toBeGreaterThan(0);
    expect(screen.getAllByText("isometric").length).toBeGreaterThan(0);
    cleanup();
  });
});
