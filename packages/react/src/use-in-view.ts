import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

type Cleanup = () => void;

/**
 * Observe an element and react to its visibility.
 * Faithful port of the POC's `use-in-view` (motion-style) hook.
 *
 * - `amount`: "some" | "all" | number (IntersectionObserver threshold)
 * - `once`: stop observing after the first intersection
 * - callback variant: return a cleanup from `onEnter` to control lifetime
 */
export function observeInView(
  targets: Element[],
  onEnter: (target: Element, entry: IntersectionObserverEntry) => Cleanup | void,
  options: { root?: Element | null; margin?: string; amount?: number | "some" | "all" } = {},
): () => void {
  const threshold =
    typeof options.amount === "number" ? options.amount : options.amount === "all" ? 1 : 0;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = targetsState.get(entry.target);
        if (entry.isIntersecting !== !!state) {
          if (entry.isIntersecting) {
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
  }: { once?: boolean; initial?: boolean; margin?: string; amount?: number | "some" | "all" } = {},
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
