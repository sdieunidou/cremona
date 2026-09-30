/** Behaviour of the two controllers, on real Stimulus and a real generated template. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

let app;
async function start(html) {
  document.body.innerHTML = html;
  app = registerCremona(Application.start());
  await tick();
  return app;
}

function mockMedia(matching) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

afterEach(() => {
  app?.stop();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-controller");
  document.body.innerHTML = "";
});

describe("cremona-theme", () => {
  const html = document.documentElement;
  const controller = () => app.getControllerForElementAndIdentifier(html, "cremona-theme");

  it("follows a dark system preference as soon as it connects", async () => {
    mockMedia(["(prefers-color-scheme: dark)"]);
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    expect(html.classList.contains("dark")).toBe(true);
  });

  it("persists the chosen theme under its storage key", async () => {
    mockMedia([]);
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    controller().themeChanged({ params: { theme: "sakura" } });
    expect(html.classList.contains("theme-sakura")).toBe(true);
    expect(localStorage.getItem("cremona-theme")).toBe("sakura");
  });

  it("still applies the theme when storage is blocked", async () => {
    mockMedia(["(prefers-color-scheme: dark)"]);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    expect(html.classList.contains("dark")).toBe(true);
    controller().toggle();
    expect(html.classList.contains("dark")).toBe(false);
  });
});

describe("cremona-visual", () => {
  const template = readFileSync(join(root, "templates/metrics/stat-card/000-default.html"), "utf8");
  const mounted = template.replace(
    'data-controller="cremona-visual"',
    'data-controller="cremona-visual" data-cremona-visual-trigger-value="mount"',
  );
  const animated = () => [...document.querySelectorAll("[data-anim-to]")];
  const visual = () =>
    app.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller="cremona-visual"]'),
      "cremona-visual",
    );

  it("plays to the target styles, and a reset restores the initial ones for a replay", async () => {
    mockMedia([]);
    await start(mounted);
    const card = animated()[0];
    expect(card.style.opacity).toBe("1");
    expect(card.style.transform).toBe("translateY(0px)");
    expect(card.style.transition).toContain("opacity");

    visual().reset();
    expect(card.style.opacity).toBe("0");
    expect(card.style.transform).toBe("translateY(8px)");

    visual().play();
    expect(card.style.opacity).toBe("1");
  });

  it("jumps to the end state without transitions under reduced motion", async () => {
    mockMedia(["(prefers-reduced-motion: reduce)"]);
    await start(mounted);
    for (const el of animated()) {
      expect(el.style.transition).toBe("none");
      expect(el.style.opacity).not.toBe("0");
    }
  });
});
