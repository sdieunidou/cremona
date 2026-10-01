import { useEffect, type RefObject } from "react";

/**
 * Scale `stage` down (CSS `scale`) so it fits inside the content box of `frame`; it is never scaled
 * up. Measures again when either element resizes or `layout` changes. Client-only: the server render
 * is unscaled.
 */
export function useFitScale(
  frame: RefObject<HTMLElement | null>,
  stage: RefObject<HTMLElement | null>,
  layout?: unknown,
) {
  useEffect(() => {
    const box = frame.current;
    const el = stage.current;
    if (!box || !el || typeof ResizeObserver === "undefined") return;
    const px = (value: string) => parseFloat(value) || 0;
    const fit = () => {
      const style = getComputedStyle(box);
      const width = box.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
      const height = box.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
      const ratio = Math.min(1, width / el.offsetWidth, height / el.offsetHeight);
      el.style.scale = ratio > 0 && ratio < 1 ? String(ratio) : "";
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.style.scale = "";
    };
  }, [frame, stage, layout]);
}
