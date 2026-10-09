import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { App } from "../src/app.js";
import {
  findComponent,
  hasDemo,
  loadDemo,
  uiCategories,
  uiComponents,
} from "../src/lib/components.js";

afterEach(cleanup);

const demoFiles = Object.keys(import.meta.glob("../src/demos/*.tsx"))
  .map((path) => /([\w-]+)\.tsx$/.exec(path)![1]!)
  .sort();

describe("UI components of the gallery", () => {
  it("lists the components of the @cremona/ui registry, grouped by category", () => {
    expect(uiComponents.length).toBeGreaterThanOrEqual(20);
    expect(uiComponents.map((c) => c.name)).toContain("dropdown-menu");
    expect(uiCategories.flatMap((c) => c.components)).toHaveLength(uiComponents.length);
    expect(findComponent("button")?.title).toBe("Button");
    expect(findComponent("nope")).toBeUndefined();
  });

  it("has a demo for every component, and only for them", () => {
    expect(demoFiles).toEqual(uiComponents.map((c) => c.name).sort());
    for (const { name } of uiComponents) expect(hasDemo(name), name).toBe(true);
  });

  it("titles the examples of a demo by their names, in the order of the file", async () => {
    const { examples, source } = await loadDemo("button");
    expect(examples.map((e) => e.title)).toEqual([
      "Variants",
      "Sizes",
      "Icon only",
      "With an icon",
      "As a link",
      "Disabled",
    ]);
    expect(source).toContain('from "@cremona/ui/button"');
  });

  it("renders a component page with its examples and its code", async () => {
    await Promise.all([loadDemo("badge"), import("../src/pages/component.js")]);
    window.history.replaceState({}, "", "/components/badge");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "Badge" })).toBeTruthy();
    expect(document.title).toBe("Badge — UI components — Cremona");
    expect(screen.getByText("npx shadcn@latest add @cremona/badge")).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Variants",
      "Status",
      "With an icon",
      "As a link",
    ]);
  }, 30000);

  it("renders the index, and not-found for a component that does not exist", async () => {
    window.history.replaceState({}, "", "/components");
    const { unmount } = render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "UI components" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /^Button/ }).length).toBeGreaterThan(0);
    unmount();
    window.history.replaceState({}, "", "/components/carousel");
    render(<App />);
    expect(document.title).toBe("Not found — Cremona");
  });
});
