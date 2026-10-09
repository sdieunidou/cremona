/**
 * End-state harness: once a block's entrance has played (`animated`, motion skipped to its final
 * keyframes, timers run out, loops at rest because the user asks for reduced motion), it must
 * render what `animated={false}` renders — the default render, and what the Stimulus templates
 * are built from.
 */
import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { compareRenders, ID_PREFIX, type EndStateDiff } from "./end-state-compare.js";
import { hydrateProps, type Props } from "./preview-props.js";

type Visual = ComponentType<Props>;

interface BlockJson {
  file: string;
  variants: { label: string }[];
}

const metas = import.meta.glob<BlockJson>("../../src/*/*/block.json", {
  eager: true,
  import: "default",
});
const previews = import.meta.glob<Record<string, Props>>("../../src/*/*/preview-props.json", {
  eager: true,
  import: "default",
});
const modules = import.meta.glob<Record<string, unknown>>("../../src/*/*/react.tsx");

function pickComponent(mod: Record<string, unknown>, file: string): Visual {
  const pascal = file
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const candidates = Object.entries(mod).filter(
    ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
  );
  const found = (candidates.find(([name]) => name === pascal) ?? candidates.at(-1))?.[1];
  if (!found) throw new Error(`${file}: no component export`);
  return found as Visual;
}

// ---------------------------------------------------------------------------------------------
// Environment: in view, reduced motion (loops rest), motion jumps to its final keyframes.

const realSetImmediate = globalThis.setImmediate;
/** One turn of the real event loop: motion's frame loop runs on happy-dom's animation frames. */
const turn = () => new Promise<void>((resolve) => realSetImmediate(resolve));

let inView = true;
const observers = new Set<ViewObserver>();

/** Observed elements are fully in view, until a test moves them out with `setInView(false)`. */
class ViewObserver {
  private targets = new Set<Element>();
  constructor(private cb: IntersectionObserverCallback) {
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
    queueMicrotask(() => this.report([target]));
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
    observers.delete(this);
  }
  takeRecords() {
    return [];
  }
  report(targets = [...this.targets]) {
    const live = targets.filter((t) => this.targets.has(t));
    if (!observers.has(this) || !live.length) return;
    this.cb(
      live.map((target) => {
        const rect = target.getBoundingClientRect();
        return {
          target,
          isIntersecting: inView,
          intersectionRatio: inView ? 1 : 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
          time: 0,
        } as IntersectionObserverEntry;
      }),
      this as unknown as IntersectionObserver,
    );
  }
}

/** Moves every observed element into or out of view. */
export async function setInView(value: boolean) {
  inView = value;
  await act(async () => {
    for (const observer of [...observers]) observer.report();
  });
}

function reducedMotion(query: string): MediaQueryList {
  return {
    matches: /prefers-reduced-motion:\s*reduce/.test(query),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

let animate: PropertyDescriptor | undefined;

export function installEndStateEnvironment() {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("IntersectionObserver", ViewObserver);
  vi.spyOn(window, "matchMedia").mockImplementation(reducedMotion);
  // happy-dom computes no styles, so motion cannot read a start value from the DOM (browsers can)
  const warn = console.warn.bind(console);
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (!/from "undefined" to .* is not an animatable value/.test(String(args[0]))) warn(...args);
  });
  MotionGlobalConfig.skipAnimations = true;
  // happy-dom's partial Web Animations make motion's skipped animations reject on cancel;
  // without them motion applies the same final values from its own frame loop
  animate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
  if (animate) delete (Element.prototype as { animate?: unknown }).animate;
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "Date",
    ],
  });
}

export function restoreEndStateEnvironment() {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  MotionGlobalConfig.skipAnimations = false;
  if (animate) Object.defineProperty(Element.prototype, "animate", animate);
}

// ---------------------------------------------------------------------------------------------

/** Simulated time an entrance may take before it counts as never settling. */
const MAX_MS = 60_000;
const MAX_STEPS = 4_000;

interface Mounted {
  host: HTMLElement;
  root: Root;
}

const mounted: Mounted[] = [];

export async function mount(element: React.ReactElement): Promise<Mounted> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host, { identifierPrefix: ID_PREFIX });
  await act(async () => root.render(element));
  const m = { host, root };
  mounted.push(m);
  return m;
}

/**
 * Plays the render to its end: motion frames, then the block's own timers one at a time,
 * until nothing is scheduled and the markup stops changing.
 */
export async function settle(host: HTMLElement): Promise<{ settled: boolean; ms: number }> {
  const start = Date.now();
  let last = "";
  let still = 0;
  for (let step = 0; step < MAX_STEPS; step++) {
    await act(async () => {
      await turn();
    });
    const html = host.innerHTML;
    if (html === last) still++;
    else still = 0;
    last = html;
    if (still < 2) continue;
    if (vi.getTimerCount() === 0) return { settled: true, ms: Date.now() - start };
    if (Date.now() - start > MAX_MS) break;
    await act(async () => {
      vi.advanceTimersToNextTimer();
    });
    still = 0;
  }
  return { settled: false, ms: Date.now() - start };
}

export function format(diffs: EndStateDiff[]): string {
  return diffs
    .slice(0, 12)
    .map((d) => `  ${d.path}\n    ${d.what}: animated end ${d.animated} ≠ static ${d.static}`)
    .join("\n");
}

/**
 * Renders the animated end state and the static render of one variant and diffs them;
 * `then` runs more of the animated render's life (leaving the viewport…) before the diff.
 */
export async function endStateDiffs(
  Component: Visual,
  props: Props,
  animatedProps: Props = { animated: true, trigger: "mount" },
  then?: (host: HTMLElement) => Promise<void>,
): Promise<{ diffs: EndStateDiff[]; settled: boolean; ms: number }> {
  const a = await mount(createElement(Component, { ...props, ...animatedProps }));
  const run = await settle(a.host);
  await then?.(a.host);
  const s = await mount(createElement(Component, { ...props, animated: false }));
  await settle(s.host);
  const ra = a.host.firstElementChild;
  const rs = s.host.firstElementChild;
  if (!ra || !rs) throw new Error("nothing rendered");
  return { diffs: compareRenders(ra, rs), ...run };
}

export function cleanup() {
  for (const m of mounted.splice(0)) {
    act(() => m.root.unmount());
    m.host.remove();
  }
  vi.clearAllTimers();
  inView = true;
}

/** Categories (folders under src/) per test file, so vitest runs them in parallel. */
export const END_STATE_SHARDS: string[][] = [
  ["activity", "ai", "api", "avatars", "branding", "browser", "calendar"],
  ["charts", "chat", "code", "connections", "dashboard"],
  ["components", "data", "devices", "ecommerce"],
  ["email", "files", "forms", "geo", "git", "images"],
  ["integrations", "keyboard", "layouts", "media", "metrics", "mobile", "notices", "notifications"],
  ["payments", "search", "security", "states", "status", "tasks"],
  ["sections"],
];

const blocks = Object.entries(metas)
  .map(([path, meta]) => {
    const [, category, file] = /\/src\/([^/]+)\/([^/]+)\/block\.json$/.exec(path)!;
    return { key: `${category}/${file}`, category: category!, meta, dir: path.slice(0, -10) };
  })
  .sort((x, y) => x.key.localeCompare(y.key));

/** A block's component and hydrated preview props by variant label, by key (`category/file`). */
export async function loadBlock(key: string) {
  const block = blocks.find((b) => b.key === key);
  if (!block) throw new Error(`no block ${key}`);
  const Component = pickComponent(await modules[`${block.dir}react.tsx`]!(), block.meta.file);
  const preview = previews[`${block.dir}preview-props.json`] ?? {};
  return {
    Component,
    labels: block.meta.variants.map((v) => v.label),
    props: (label: string) => {
      if (!(label in preview)) throw new Error(`${key}: no preview props for "${label}"`);
      return hydrateProps(preview[label]) as Props;
    },
  };
}

/** One test per variant of every block in shard `index` of END_STATE_SHARDS. */
export function describeEndState(index: number) {
  beforeAll(installEndStateEnvironment);
  afterEach(cleanup);
  afterAll(restoreEndStateEnvironment);

  const categories = END_STATE_SHARDS[index]!;
  it("the shards cover every category once", () => {
    const all = [...new Set(blocks.map((b) => b.category))].sort();
    expect(END_STATE_SHARDS.flat().sort()).toEqual(all);
  });

  for (const block of blocks.filter((b) => categories.includes(b.category))) {
    describe(block.key, () => {
      for (const { label } of block.meta.variants) {
        it(label, async () => {
          const { Component, props } = await loadBlock(block.key);
          const { diffs, settled, ms } = await endStateDiffs(Component, props(label));
          expect(settled, `the entrance never settles (${ms} ms of timers)`).toBe(true);
          if (diffs.length)
            throw new Error(
              `${block.key} · ${label}: ${diffs.length} difference(s) between the end of the entrance and animated={false}\n${format(diffs)}`,
            );
        });
      }
    });
  }
}
