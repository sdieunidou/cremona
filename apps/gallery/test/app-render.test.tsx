import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { App } from "../src/app.js";
import { stats, blockKeys, loadBlock } from "../src/lib/discovery.js";

afterEach(cleanup);

function renderAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

describe("gallery app", () => {
  it("discovers all 160 blocks", () => {
    expect(stats.blocks).toBe(160);
    expect(blockKeys).toHaveLength(160);
    expect(stats.variants).toBeGreaterThan(1000);
  });

  it("renders the home grid with categories", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: "All visual compositions" })).toBeTruthy();
    // category appears in the sidebar and as a section heading
    expect(screen.getAllByText("Metrics").length).toBeGreaterThanOrEqual(2);
    expect(document.title).toBe("Cremona — animated visual blocks");
  });

  it("never nests a link or a control inside a card link", () => {
    const { container } = renderAt("/");
    expect(container.querySelectorAll("a a, a button")).toHaveLength(0);
    // one stretched title link per card
    expect(container.querySelectorAll("main h3 a")).toHaveLength(160);
  });

  it("has landmarks and a skip link", () => {
    renderAt("/");
    expect(screen.getByRole("navigation", { name: "Visuals" })).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe(
      "#main",
    );
  });

  it("renders a block page with all its variants", async () => {
    // the page and the block load lazily: warm both so a busy machine does not time out
    await Promise.all([loadBlock("metrics/stat-card"), import("../src/pages/block.js")]);
    renderAt("/visuals/metrics/stat-card");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Stat Card" }, { timeout: 15000 }),
    ).toBeTruthy();
    // the 6 core variants' labels appear in preview footers
    expect(screen.getAllByText("default").length).toBeGreaterThan(0);
    expect(screen.getAllByText("isometric").length).toBeGreaterThan(0);
    expect(document.title).toBe("Stat Card — Metrics — Cremona");
  });

  it("renders a not-found page for unknown routes", () => {
    renderAt("/visuals/charts/pie-chart");
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to all visuals" })).toBeTruthy();
    // suggestions from the path words
    expect(screen.getByRole("heading", { name: "Maybe one of these" })).toBeTruthy();
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs.some((href) => href?.startsWith("/visuals/charts/"))).toBe(true);
    expect(document.title).toBe("Not found — Cremona");
    cleanup();
    renderAt("/nope");
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeTruthy();
  });
});
