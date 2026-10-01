import { useEffect, useState } from "react";
import type { RefObject } from "react";

type Cleanup = () => void;
type Amount = number | "some" | "all";

/** Thresholds between 0 and `amount`: the steps a target can enter at when `amount` is out of its reach. */
const STEPS = 20;

/**
 * The highest threshold step the entry's target can cross: its intersection ratio
 * cannot exceed the share of it that fits in the root (a block taller than twice
 * the viewport never shows half of itself).
 */
function reachable(entry: IntersectionObserverEntry, step: number): number {
  const box = entry.boundingClientRect;
  const root = entry.rootBounds;
  if (!root || box.width <= 0 || box.height <= 0) return 1;
  const max =
    (Math.min(box.width, root.width) * Math.min(box.height, root.height)) /
    (box.width * box.height);
  return max >= 1 ? 1 : Math.max(0, Math.floor((max - 1e-3) / step) * step);
}

/**
 * Observe an element and react to its visibility.
 * Faithful port of the POC's `use-in-view` (motion-style) hook.
 *
 * - `amount`: "some" | "all" | number (share of the element that must be visible),
 *   capped at the share the element can reach within the root
 * - `once`: stop observing after the first intersection
 * - callback variant: return a cleanup from `onEnter` to control lifetime
 */
export function observeInView(
  targets: Element[],
  onEnter: (target: Element, entry: IntersectionObserverEntry) => Cleanup | void,
  options: { root?: Element | null; margin?: string; amount?: Amount } = {},
): () => void {
  const amount =
    typeof options.amount === "number" ? options.amount : options.amount === "all" ? 1 : 0;
  const step = amount / STEPS;
  const threshold = amount > 0 ? Array.from({ length: STEPS + 1 }, (_, i) => i * step) : 0;
  const isIn = (entry: IntersectionObserverEntry) =>
    entry.isIntersecting &&
    (amount === 0 || entry.intersectionRatio + 1e-6 >= Math.min(amount, reachable(entry, step)));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = targetsState.get(entry.target);
        const inView = isIn(entry);
        if (inView !== !!state) {
          if (inView) {
            const cleanup = onEnter(entry.target, entry);
            if (typeof cleanup === "function") targetsState.set(entry.target, cleanup);
            else io.unobserve(entry.target);
          } else if (typeof targetsState.get(entry.target) === "function") {
            targetsState.get(entry.target)?.();
            targetsState.delete(entry.target);
          }
        }
      }
    },
    { root: options.root, rootMargin: options.margin, threshold },
  );
  const targetsState = new WeakMap<Element, Cleanup>();
  for (const t of targets) io.observe(t);
  return () => io.disconnect();
}

/** React hook: true once (or every time) the element enters the viewport. */
export function useInView(
  ref: RefObject<Element | null>,
  {
    once = false,
    initial = false,
    margin,
    amount,
  }: { once?: boolean; initial?: boolean; margin?: string; amount?: Amount } = {},
): boolean {
  const [inView, setInView] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return;
    const enter = () => {
      setInView(true);
      return once ? undefined : () => setInView(false);
    };
    const stop = observeInView([el], enter, { margin, amount });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, once, margin, amount]);
  return inView;
}
