import { Controller } from "@hotwired/stimulus";

/**
 * cremona-visual — plays the entrance animation of a Cremona template.
 *
 * The template markup is the block's final state, so it reads correctly without
 * JavaScript. Animated elements carry the declarations of their initial state:
 *   data-anim-from="opacity:0;transform:translateY(8px)"  start of the animation
 *   data-anim-to="stroke-dasharray:1 1"                    explicit end, when the
 *                                                          final value cannot be interpolated
 *   data-anim-path="1"                                     dash values are fractions of
 *                                                          the element's length
 * On connect the controller shows those initial states (Web Animations, paused),
 * then plays them back to the markup — per `trigger` — with a stagger by
 * document order. When an animation ends nothing is left on the element.
 *
 * Nothing is hidden when the user prefers reduced motion, when Web Animations or
 * IntersectionObserver are missing, on a Turbo preview, or once the visual has
 * played (`played` value, set before Turbo caches the page).
 *
 * When the same template is on the page more than once, each copy gets its own
 * ids at connect (and after a Turbo morph), with every reference to them.
 *
 * Values:
 *   trigger   "inView" (default) | "inViewRepeat" (replays on every entry) | "mount"
 *   duration  ms per element (450)
 *   stagger   ms between two elements (70), squeezed so a cascade lasts at most 1.2 s
 *   delay     ms before the first element (60)
 *   easing    CSS easing (a soft ease-out)
 *   amount    share of the visual in view that starts it (0.5), capped to half
 *             the viewport for visuals taller than the viewport
 *   timeout   ms a partly visible visual waits before playing anyway (2000)
 *   played    true: show the final state (set by the controller for Turbo)
 */
export default class CremonaVisualController extends Controller {
  static values = {
    trigger: { type: String, default: "inView" },
    duration: { type: Number, default: 450 },
    stagger: { type: Number, default: 70 },
    delay: { type: Number, default: 60 },
    easing: { type: String, default: "cubic-bezier(0.22, 1, 0.36, 1)" },
    amount: { type: Number, default: 0.5 },
    timeout: { type: Number, default: 2000 },
    played: { type: Boolean, default: false },
  };

  connect() {
    watchTurbo();
    uniqueIds(this.element);
    const revealed = releaseGuard();
    this.animations = [];
    this.state = "done";
    if (reducedMotion() || isTurboPreview() || !canAnimate(this.element)) return;
    const repeat = this.triggerValue === "inViewRepeat";
    const mount = this.triggerValue === "mount";
    if (!mount && typeof IntersectionObserver === "undefined") return;
    const shown = this.playedValue || (revealed && onScreen(this.element));
    if (shown && !repeat) return;

    this.prepare();
    if (this.animations.length === 0) return;
    this.onBeforeCache = () => {
      if (this.state !== "idle") this.playedValue = true;
    };
    this.onPrint = () => this.finish();
    document.addEventListener("turbo:before-cache", this.onBeforeCache);
    window.addEventListener("beforeprint", this.onPrint);
    if (shown) this.finish();
    if (mount) this.play();
    else this.observe(repeat);
  }

  disconnect() {
    clearTimeout(this.safety);
    this.observer?.disconnect();
    this.observer = null;
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
    this.state = "done";
    if (this.onBeforeCache) document.removeEventListener("turbo:before-cache", this.onBeforeCache);
    if (this.onPrint) window.removeEventListener("beforeprint", this.onPrint);
  }

  /** Create one paused animation per animated element: its initial state shows at once. */
  prepare() {
    const elements = [this.element, ...this.element.querySelectorAll("[data-anim-from]")].filter(
      (el) => el.hasAttribute("data-anim-from"),
    );
    const step =
      elements.length > 1 ? Math.min(this.staggerValue, 1200 / (elements.length - 1)) : 0;
    elements.forEach((el, index) => {
      const frames = keyframes(el);
      if (!frames) return;
      try {
        const animation = el.animate(frames, {
          duration: this.durationValue,
          delay: this.delayValue + index * step,
          easing: this.easingValue,
          fill: "backwards",
        });
        animation.pause();
        this.animations.push(animation);
      } catch {
        // an unsupported declaration leaves this element in its final state
      }
    });
    this.state = "idle";
  }

  /** Play every element from its initial state to the markup. */
  play() {
    if (this.state !== "idle") return;
    clearTimeout(this.safety);
    this.safety = null;
    if (reducedMotion()) return this.finish();
    this.state = "running";
    const run = (this.run = {});
    for (const animation of this.animations) animation.play();
    Promise.all(this.animations.map((a) => a.finished)).then(
      () => {
        if (this.run !== run) return;
        this.state = "done";
        if (this.triggerValue !== "inViewRepeat") this.release();
      },
      () => {},
    );
  }

  /** Back to the initial state, ready to replay. */
  reset() {
    if (this.state === "idle" || this.animations.length === 0) return;
    this.run = null;
    for (const animation of this.animations) {
      animation.pause();
      animation.currentTime = 0;
    }
    this.state = "idle";
  }

  /** Jump to the final state (printing, reduced motion, an already played visual). */
  finish() {
    this.run = null;
    clearTimeout(this.safety);
    this.safety = null;
    for (const animation of this.animations) animation.finish();
    this.state = "done";
    if (this.triggerValue !== "inViewRepeat") this.release();
  }

  release() {
    this.observer?.disconnect();
    this.observer = null;
    for (const animation of this.animations) animation.cancel();
    this.animations = [];
  }

  observe(repeat) {
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry.isIntersecting) {
          clearTimeout(this.safety);
          this.safety = null;
          if (repeat) this.reset();
          return;
        }
        if (this.state !== "idle") return;
        const viewport = entry.rootBounds?.height || window.innerHeight;
        const height = entry.boundingClientRect.height;
        const needed = this.amountValue * Math.min(1, height > 0 ? viewport / height : 1);
        if (entry.intersectionRatio >= needed - 0.001) this.play();
        else if (!this.safety)
          this.safety = setTimeout(() => {
            this.safety = null;
            this.play();
          }, this.timeoutValue);
      },
      { threshold: THRESHOLDS },
    );
    this.observer.observe(this.element);
  }
}

const REDUCE = "(prefers-reduced-motion: reduce)";
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
const HELD = new Set(["transform-origin", "transform-box"]);
const DASHES = new Set(["stroke-dasharray", "stroke-dashoffset"]);
const SELECTOR = '[data-controller~="cremona-visual"]';
const PLAYED = "data-cremona-visual-played-value";

const reducedMotion = () => !!window.matchMedia?.(REDUCE).matches;
const isTurboPreview = () => document.documentElement.hasAttribute("data-turbo-preview");
const canAnimate = (el) => typeof el.animate === "function";

function onScreen(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

/**
 * The optional head guard (docs/stimulus.md) hides visuals until a controller
 * connects: lift it once this batch of controllers has connected. Returns true
 * when the guard's own timeout already revealed the page.
 */
function releaseGuard() {
  const root = document.documentElement;
  const revealed = root.classList.contains("cremona-revealed");
  if (revealed || root.classList.contains("cremona-pending"))
    queueMicrotask(() => root.classList.remove("cremona-pending", "cremona-revealed"));
  return revealed;
}

const ID_LISTS = new Set([
  "for",
  "headers",
  "list",
  "form",
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
]);
let copies = 0;

/**
 * Give this copy of a template its own ids when another element of the document
 * uses one of them, and rewrite the references: id lists (for, aria-*),
 * `href="#…"` and `url(#…)` (SVG paint, clip paths, masks, filters, styles).
 */
function uniqueIds(root) {
  const owned = [...root.querySelectorAll("[id]")].filter((el) => el.id);
  const taken = (id) =>
    document.querySelectorAll(`[id="${id.replace(/["\\]/g, "\\$&")}"]`).length > 1;
  if (!owned.some((el) => taken(el.id))) return;
  const suffix = `-${++copies}`;
  const ids = new Map(owned.map((el) => [el.id, `${el.id}${suffix}`]));
  for (const el of owned) el.id = ids.get(el.id);
  const urls = (value) =>
    value.replace(/url\((['"]?)#([^'")]+)\1\)/g, (all, quote, id) =>
      ids.has(id) ? `url(${quote}#${ids.get(id)}${quote})` : all,
    );
  for (const el of [root, ...root.querySelectorAll("*")]) {
    for (const attr of [...el.attributes]) {
      const { name, value } = attr;
      let next = value;
      if (ID_LISTS.has(name))
        next = value
          .split(/\s+/)
          .map((token) => ids.get(token) ?? token)
          .join(" ");
      else if ((name === "href" || name === "xlink:href") && value.startsWith("#"))
        next = ids.has(value.slice(1)) ? `#${ids.get(value.slice(1))}` : value;
      else if (value.includes("url(")) next = urls(value);
      if (next === value) continue;
      if (name === "style")
        el.style.cssText = next; // CSSOM: allowed by a strict style-src
      else attr.value = next;
    }
  }
}

let turboWatched = false;
let previewRendered = false;

/**
 * A Turbo visit to a cached page shows the cached copy (a preview, final state)
 * then renders the fresh page: its visuals must not hide and replay.
 */
function watchTurbo() {
  if (turboWatched) return;
  turboWatched = true;
  // a morph restores the server's ids on the elements it keeps
  document.addEventListener("turbo:morph", () => {
    for (const el of document.querySelectorAll(SELECTOR)) uniqueIds(el);
  });
  document.addEventListener("turbo:visit", () => {
    previewRendered = false;
  });
  document.addEventListener("turbo:before-render", (event) => {
    if (isTurboPreview()) {
      previewRendered = true;
      return;
    }
    if (!previewRendered) return;
    previewRendered = false;
    for (const el of event.detail?.newBody?.querySelectorAll?.(SELECTOR) ?? [])
      el.setAttribute(PLAYED, "true");
  });
}

/** `a:b;c:url(x;y)` → [["a", "b"], ["c", "url(x;y)"]] */
function declarations(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  const text = css ?? "";
  const push = (end) => {
    const declaration = text.slice(start, end);
    const colon = declaration.indexOf(":");
    if (colon > 0)
      out.push([declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()]);
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) {
      push(i);
      start = i + 1;
    }
  }
  push(text.length);
  return out;
}

const camel = (prop) => prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Dash values given in fractions of `data-anim-path`, in the element's own units. */
function scaleDashes(value, factor) {
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => {
      const n = Number.parseFloat(part);
      return Number.isFinite(n) && /^-?[\d.]+(e-?\d+)?(px)?$/i.test(part)
        ? `${n * factor}px`
        : part;
    })
    .join(" ");
}

/** Web Animations keyframes of one element: its initial state, then (implicitly) its markup. */
function keyframes(el) {
  let from = declarations(el.getAttribute("data-anim-from"));
  let to = declarations(el.getAttribute("data-anim-to"));
  const path = Number(el.getAttribute("data-anim-path"));
  if (path > 0) {
    let length = 0;
    try {
      length = el.getTotalLength?.() ?? 0;
    } catch {
      length = 0;
    }
    const scale = ([prop, value]) => [prop, scaleDashes(value, (length + 1) / path)];
    if (length > 0) {
      from = from.map((d) => (DASHES.has(d[0]) ? scale(d) : d));
      to = to.map((d) => (DASHES.has(d[0]) ? scale(d) : d));
    } else {
      from = from.filter(([prop]) => !DASHES.has(prop));
      to = to.filter(([prop]) => !DASHES.has(prop));
    }
  }
  if (from.length === 0) return null;
  const start = { offset: 0 };
  const end = { offset: 1 };
  let explicitEnd = false;
  for (const [prop, value] of from) {
    start[camel(prop)] = value;
    if (HELD.has(prop)) {
      end[camel(prop)] = value;
      explicitEnd = true;
    }
  }
  for (const [prop, value] of to) {
    end[camel(prop)] = value;
    explicitEnd = true;
  }
  return explicitEnd ? [start, end] : [start];
}
