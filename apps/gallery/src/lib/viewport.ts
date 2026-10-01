/** Viewport helpers: one shared IntersectionObserver for "is this card near the screen yet?". */
import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

function nearObserver(): IntersectionObserver | undefined {
  if (!observer && typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      },
      // about two rows of cards ahead, so thumbnails are ready when they scroll in
      { rootMargin: "600px 0px" },
    );
  }
  return observer;
}

/** False until the element comes within ~600px of the viewport, then true for good. */
export function useNearViewport(ref: RefObject<Element | null>): boolean {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    const io = nearObserver();
    if (!el || !io || near) return;
    callbacks.set(el, () => setNear(true));
    io.observe(el);
    return () => {
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, [ref, near]);
  return near;
}

/** Live `matchMedia(query).matches`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia?.(query);
      media?.addEventListener("change", onChange);
      return () => media?.removeEventListener("change", onChange);
    },
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  );
}
