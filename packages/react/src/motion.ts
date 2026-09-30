import { useEffect, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia(REDUCE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * The user asks for reduced motion (`prefers-reduced-motion: reduce`).
 * `false` on the server and while hydrating, so server markup never depends on it.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCE).matches,
    () => false,
  );
}

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * Whether a looping animation (infinite motion transition, timer, rAF, SMIL, CSS
 * `animate-*`) should run now: `enabled`, the element intersects the viewport, the
 * page is visible and the user does not ask for reduced motion.
 *
 * `true` on the server and while hydrating — a looping block's server markup is its
 * looping state — then it follows the element. When it turns `false`, render the
 * loop's resting frame.
 */
export function useLoopActive(ref: RefObject<Element | null>, enabled = true): boolean {
  const reduced = usePrefersReducedMotion();
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled]);
  return enabled && inView && pageVisible && !reduced;
}
