/** Behaviour of the two controllers, on real Stimulus, generated templates and fake Web Animations. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const html = document.documentElement;

let app;
/** Application#stop() does not disconnect controllers: unload them first. */
function stop() {
  app?.unload("cremona-visual", "cremona-theme");
  app?.stop();
  app = undefined;
}
async function start(markup) {
  document.body.innerHTML = markup;
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

/** Minimal Web Animations: records keyframes/options and the play state. */
let animations = [];
class FakeAnimation {
  constructor(target, keyframes, options) {
    Object.assign(this, { target, keyframes, options, playState: "running", time: 0 });
    this.renew();
    animations.push(this);
  }
  renew() {
    this.finished = new Promise((resolve, reject) => Object.assign(this, { resolve, reject }));
    this.finished.catch(() => {}); // browsers mark a cancelled animation's promise as handled
  }
  get currentTime() {
    return this.time;
  }
  set currentTime(value) {
    if (this.playState === "finished") this.renew();
    if (this.playState === "finished") this.playState = "paused";
    this.time = value;
  }
  play() {
    this.playState = "running";
  }
  pause() {
    this.playState = "paused";
  }
  finish() {
    this.playState = "finished";
    this.time = this.options.delay + this.options.duration;
    this.resolve(this);
  }
  cancel() {
    this.playState = "idle";
    this.reject(new DOMException("cancelled", "AbortError"));
  }
}

/** IntersectionObserver driven by the test. */
let observers = [];
class FakeObserver {
  constructor(callback, options) {
    Object.assign(this, { callback, options, targets: new Set() });
    observers.push(this);
  }
  observe(el) {
    this.targets.add(el);
  }
  unobserve(el) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
}
function view(el, ratio, { height = 300, viewport = 900 } = {}) {
  for (const o of observers.filter((o) => o.targets.has(el)))
    o.callback([
      {
        target: el,
        isIntersecting: ratio > 0,
        intersectionRatio: ratio,
        boundingClientRect: { height },
        rootBounds: { height: viewport },
      },
    ]);
}
const finishAll = async () => {
  for (const a of animations) if (a.playState === "running") a.finish();
  await tick();
};

const nativeAnimate = Element.prototype.animate;
beforeEach(() => {
  animations = [];
  observers = [];
  Element.prototype.animate = function (keyframes, options) {
    return new FakeAnimation(this, keyframes, options);
  };
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

afterEach(() => {
  stop();
  Element.prototype.animate = nativeAnimate;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
  html.className = "";
  html.removeAttribute("style");
  for (const name of [...html.attributes].map((a) => a.name))
    if (name.startsWith("data-")) html.removeAttribute(name);
  document.body.innerHTML = "";
});

const VISUAL = `<div data-controller="cremona-visual" class="size-full">
  <div id="card" data-anim-from="opacity:0;transform:translateY(8px)"></div>
  <div id="bar" data-anim-from="opacity:0;transform:scaleY(0);transform-origin:top"></div>
  <svg><path id="line" d="M0 0H10" data-anim-from="opacity:0;stroke-dasharray:0 1;stroke-dashoffset:0" data-anim-to="stroke-dasharray:1 1;stroke-dashoffset:0" data-anim-path="1"></path></svg>
  <div id="fill" style="width:64%" data-anim-from="width:0%"></div>
  <div id="reveal" data-anim-from="clip-path:circle(0% at 50% 100%)" data-anim-to="clip-path:circle(150% at 50% 100%)"></div>
</div>`;
const visual = () => document.querySelector('[data-controller~="cremona-visual"]');
const controller = () => app.getControllerForElementAndIdentifier(visual(), "cremona-visual");
const withValues = (markup, values) =>
  markup.replace(
    'data-controller="cremona-visual"',
    `data-controller="cremona-visual" ${Object.entries(values)
      .map(([k, v]) => `data-cremona-visual-${k}-value="${v}"`)
      .join(" ")}`,
  );
const animationOf = (id) => animations.find((a) => a.target.id === id);
const states = () => animations.map((a) => a.playState);

describe("cremona-visual", () => {
  beforeEach(() => {
    mockMedia([]);
    vi.spyOn(SVGGeometryElement.prototype, "getTotalLength").mockReturnValue(99);
  });

  it("shows each initial state at connect without touching the markup", async () => {
    await start(VISUAL);
    expect(animations).toHaveLength(5);
    expect(states()).toEqual(Array(5).fill("paused"));
    expect(animationOf("card").keyframes).toEqual([
      { offset: 0, opacity: "0", transform: "translateY(8px)" },
    ]);
    expect(animationOf("card").options).toMatchObject({
      duration: 450,
      delay: 60,
      fill: "backwards",
    });
    expect(animations.map((a) => a.options.delay)).toEqual([60, 130, 200, 270, 340]);
    expect(document.getElementById("fill").getAttribute("style")).toBe("width:64%");
    expect(document.getElementById("card").hasAttribute("style")).toBe(false);
  });

  it("holds the transform origin, rescales path draws and ends clip reveals explicitly", async () => {
    await start(VISUAL);
    expect(animationOf("bar").keyframes).toEqual([
      { offset: 0, opacity: "0", transform: "scaleY(0)", transformOrigin: "top" },
      { offset: 1, transformOrigin: "top" },
    ]);
    // (length + 1) / pathLength: the dash covers the whole stroke
    expect(animationOf("line").keyframes).toEqual([
      { offset: 0, opacity: "0", strokeDasharray: "0px 100px", strokeDashoffset: "0px" },
      { offset: 1, strokeDasharray: "100px 100px", strokeDashoffset: "0px" },
    ]);
    expect(animationOf("reveal").keyframes[1]).toEqual({
      offset: 1,
      clipPath: "circle(150% at 50% 100%)",
    });
  });

  it("squeezes a long cascade into 1.2 s", async () => {
    const items = Array.from({ length: 61 }, () => '<i data-anim-from="opacity:0"></i>').join("");
    await start(`<div data-controller="cremona-visual">${items}</div>`);
    expect(animations.at(-1).options.delay).toBe(60 + 1200);
    expect(animations[1].options.delay).toBe(80);
  });

  it("plays once half of it is in view, then releases everything (inView)", async () => {
    await start(VISUAL);
    view(visual(), 0.3);
    expect(states()).toEqual(Array(5).fill("paused"));
    view(visual(), 0.55);
    expect(states()).toEqual(Array(5).fill("running"));
    await finishAll();
    expect(controller().state).toBe("done");
    expect(states()).toEqual(Array(5).fill("idle"));
    expect(observers[0].targets.size).toBe(0);
  });

  it("caps the threshold to half the viewport for a panel taller than the viewport", async () => {
    await start(VISUAL);
    view(visual(), 0.2, { height: 2000, viewport: 900 });
    expect(states()[0]).toBe("paused");
    view(visual(), 0.25, { height: 2000, viewport: 900 });
    expect(states()[0]).toBe("running");
  });

  it("plays a visual that stays partly visible after the timeout", async () => {
    await start(VISUAL);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    view(visual(), 0.1);
    vi.advanceTimersByTime(1999);
    expect(states()[0]).toBe("paused");
    vi.advanceTimersByTime(1);
    expect(states()[0]).toBe("running");
  });

  it("forgets the timeout when the visual leaves before it fires", async () => {
    await start(VISUAL);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    view(visual(), 0.1);
    view(visual(), 0);
    vi.advanceTimersByTime(5000);
    expect(states()[0]).toBe("paused");
  });

  it("resets on exit and replays on entry (inViewRepeat)", async () => {
    await start(withValues(VISUAL, { trigger: "inViewRepeat" }));
    view(visual(), 0.8);
    await finishAll();
    expect(states()).toEqual(Array(5).fill("finished"));
    view(visual(), 0);
    expect(states()).toEqual(Array(5).fill("paused"));
    expect(animations.every((a) => a.currentTime === 0)).toBe(true);
    view(visual(), 0.8);
    expect(states()).toEqual(Array(5).fill("running"));
  });

  it("plays right away on mount", async () => {
    await start(withValues(VISUAL, { trigger: "mount" }));
    expect(states()).toEqual(Array(5).fill("running"));
    expect(observers).toHaveLength(0);
  });

  it("takes timing values", async () => {
    await start(withValues(VISUAL, { duration: 200, stagger: 10, delay: 0, easing: "linear" }));
    expect(animations.map((a) => a.options.delay)).toEqual([0, 10, 20, 30, 40]);
    expect(animations[0].options).toMatchObject({ duration: 200, easing: "linear" });
  });

  it("keeps the final state under reduced motion", async () => {
    mockMedia(["(prefers-reduced-motion: reduce)"]);
    await start(VISUAL);
    expect(animations).toHaveLength(0);
  });

  it("keeps the final state without Web Animations or IntersectionObserver", async () => {
    Element.prototype.animate = undefined;
    await start(VISUAL);
    expect(animations).toHaveLength(0);
    stop();
    Element.prototype.animate = function (keyframes, options) {
      return new FakeAnimation(this, keyframes, options);
    };
    vi.stubGlobal("IntersectionObserver", undefined);
    await start(VISUAL);
    expect(animations).toHaveLength(0);
  });

  it("finishes everything before printing", async () => {
    await start(VISUAL);
    window.dispatchEvent(new Event("beforeprint"));
    expect(states()).toEqual(Array(5).fill("idle"));
  });

  it("cancels its animations when disconnected", async () => {
    await start(VISUAL);
    view(visual(), 1);
    visual().remove();
    await tick();
    expect(states()).toEqual(Array(5).fill("idle"));
  });

  describe("with Turbo", () => {
    it("marks a played visual before caching, and shows it final when restored", async () => {
      await start(VISUAL);
      view(visual(), 1);
      document.dispatchEvent(new Event("turbo:before-cache"));
      await tick();
      expect(visual().getAttribute("data-cremona-visual-played-value")).toBe("true");
      const cached = document.body.innerHTML;
      stop();
      animations = [];
      await start(cached);
      expect(animations).toHaveLength(0);
    });

    it("leaves an unplayed visual to play when restored", async () => {
      await start(VISUAL);
      document.dispatchEvent(new Event("turbo:before-cache"));
      await tick();
      expect(visual().hasAttribute("data-cremona-visual-played-value")).toBe(false);
    });

    it("does not animate a preview, nor the fresh page that replaces it", async () => {
      html.setAttribute("data-turbo-preview", "");
      await start(VISUAL);
      expect(animations).toHaveLength(0);

      document.dispatchEvent(new Event("turbo:visit"));
      document.dispatchEvent(new CustomEvent("turbo:before-render", { detail: {} }));
      html.removeAttribute("data-turbo-preview");
      const fresh = document.createElement("body");
      fresh.innerHTML = VISUAL;
      document.dispatchEvent(
        new CustomEvent("turbo:before-render", { detail: { newBody: fresh } }),
      );
      expect(fresh.firstElementChild.getAttribute("data-cremona-visual-played-value")).toBe("true");
    });

    it("animates the fresh page of a visit without preview", async () => {
      await start("");
      document.dispatchEvent(new Event("turbo:visit"));
      const fresh = document.createElement("body");
      fresh.innerHTML = VISUAL;
      document.dispatchEvent(
        new CustomEvent("turbo:before-render", { detail: { newBody: fresh } }),
      );
      expect(fresh.firstElementChild.hasAttribute("data-cremona-visual-played-value")).toBe(false);
    });
  });

  describe("with the head guard", () => {
    it("lifts the guard once the controllers have connected", async () => {
      html.classList.add("cremona-pending");
      await start(VISUAL);
      expect(html.classList.contains("cremona-pending")).toBe(false);
      expect(animations).toHaveLength(5);
    });

    it("keeps visuals already revealed on screen in their final state", async () => {
      html.classList.add("cremona-revealed");
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        top: 10,
        left: 10,
        bottom: 300,
        right: 400,
        width: 390,
        height: 290,
      });
      await start(VISUAL);
      expect(animations).toHaveLength(0);
      expect(html.classList.contains("cremona-revealed")).toBe(false);
    });
  });

  it("animates every annotated element of a generated template", async () => {
    const template = readFileSync(
      join(root, "templates/metrics/stat-card/000-default.html"),
      "utf8",
    );
    await start(template);
    const annotated = document.querySelectorAll("[data-anim-from]");
    expect(annotated.length).toBeGreaterThan(5);
    expect(animations.map((a) => a.target)).toEqual([...annotated]);
    view(visual(), 1);
    expect(states().every((s) => s === "running")).toBe(true);
  });
});

describe("cremona-theme", () => {
  const theme = () => app.getControllerForElementAndIdentifier(html, "cremona-theme");
  const events = [];
  const record = (e) => events.push(e.detail);
  beforeEach(() => {
    events.length = 0;
    document.addEventListener("cremona-theme:changed", record);
  });
  afterEach(() => document.removeEventListener("cremona-theme:changed", record));

  it("follows a dark system preference as soon as it connects", async () => {
    mockMedia(["(prefers-color-scheme: dark)"]);
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.style.colorScheme).toBe("dark");
    expect(events.at(-1)).toEqual({ appearance: "system", theme: "default", dark: true });
  });

  it("persists the chosen theme and appearance under their storage keys", async () => {
    mockMedia([]);
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    theme().setTheme({ params: { theme: "sakura" } });
    theme().setAppearance({ params: { appearance: "dark" } });
    expect(html.classList.contains("theme-sakura")).toBe(true);
    expect(html.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("cremona-theme")).toBe("sakura");
    expect(localStorage.getItem("cremona-appearance")).toBe("dark");
    await tick();
    expect(events.map((e) => `${e.appearance} ${e.theme}`)).toEqual([
      "system default",
      "system sakura",
      "dark sakura",
    ]);
  });

  it("works from data-action with params", async () => {
    mockMedia([]);
    html.setAttribute("data-controller", "cremona-theme");
    await start(
      `<button data-action="cremona-theme#setTheme" data-cremona-theme-theme-param="zen">zen</button>`,
    );
    document.querySelector("button").click();
    expect(html.classList.contains("theme-zen")).toBe(true);
  });

  it("restores a stored choice over the rendered values", async () => {
    mockMedia([]);
    localStorage.setItem("cremona-appearance", "dark");
    localStorage.setItem("cremona-theme", "sakura");
    html.setAttribute("data-controller", "cremona-theme");
    html.setAttribute("data-cremona-theme-appearance-value", "light");
    await start("");
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.classList.contains("theme-sakura")).toBe(true);
  });

  it("keeps the rendered values when storage is turned off", async () => {
    mockMedia([]);
    localStorage.setItem("cremona-appearance", "dark");
    html.setAttribute("data-controller", "cremona-theme");
    html.setAttribute("data-cremona-theme-appearance-value", "light");
    html.setAttribute("data-cremona-theme-storage-key-value", "");
    await start("");
    expect(html.classList.contains("dark")).toBe(false);
    theme().toggle();
    expect(html.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("cremona-appearance")).toBe("dark");
  });

  it("applies values changed at runtime", async () => {
    mockMedia([]);
    html.setAttribute("data-controller", "cremona-theme");
    await start("");
    html.setAttribute("data-cremona-theme-appearance-value", "dark");
    html.setAttribute("data-cremona-theme-theme-value", "zen");
    await tick();
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.classList.contains("theme-zen")).toBe(true);
    html.setAttribute("data-cremona-theme-theme-value", "default");
    await tick();
    expect([...html.classList].some((c) => c.startsWith("theme-"))).toBe(false);
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
    theme().toggle();
    expect(html.classList.contains("dark")).toBe(false);
  });
});
