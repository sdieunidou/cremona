/** Focus management for overlays: trap, Escape, background inert, focus restore. */
import { useEffect, useEffectEvent, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keyboard-reachable elements inside `root`, in tab order. */
export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
  );
}

export interface FocusTrapOptions {
  onEscape: () => void;
  /** Element to focus when the trap starts (default: the first focusable). */
  initialFocus?: () => HTMLElement | null | undefined;
  /** Elements made inert while the trap is active (the page behind the overlay). */
  inertOutside?: () => (HTMLElement | null | undefined)[];
  lockScroll?: boolean;
}

/**
 * While `active`, Tab and Shift+Tab cycle inside `ref`, Escape calls `onEscape`
 * and the `inertOutside` elements ignore focus and clicks; when it ends, focus
 * returns to the element that had it before.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  options: FocusTrapOptions,
) {
  const onEscape = useEffectEvent(() => options.onEscape());
  const initialFocus = useEffectEvent(() => options.initialFocus?.());
  const inertOutside = useEffectEvent(() => options.inertOutside?.() ?? []);
  const lockScroll = options.lockScroll ?? false;

  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inert = inertOutside().filter((el): el is HTMLElement => !!el && !el.inert);
    for (const el of inert) el.inert = true;
    const scroll = document.documentElement.style.overflow;
    if (lockScroll) document.documentElement.style.overflow = "hidden";
    (initialFocus() ?? focusables(root)[0])?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables(root);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        e.preventDefault();
        return;
      }
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !root.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !root.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      for (const el of inert) el.inert = false;
      if (lockScroll) document.documentElement.style.overflow = scroll;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, ref, lockScroll]);
}
