/** Tiny history router (no dependency). */
import { useCallback, useEffect, useState, type MouseEvent } from "react";

export type Route =
  | { name: "home" }
  | { name: "block"; category: string; file: string }
  | { name: "components" }
  | { name: "component"; component: string }
  | { name: "not-found" };

/** Set by an in-app navigation so the next page moves focus to its heading. */
let focusPending = false;

export function takePendingFocus(): boolean {
  const pending = focusPending;
  focusPending = false;
  return pending;
}

export function useRoute(): [string, (to: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => {
      focusPending = true;
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, "", to);
    focusPending = true;
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return [path, navigate];
}

/** Route parser: "/" | "/visuals/<category>/<file>" | "/components" | "/components/<name>" | anything else (not found). */
export function parseRoute(path: string): Route {
  if (path === "/" || path === "") return { name: "home" };
  const m = /^\/visuals\/([\w-]+)\/([\w-]+)\/?$/.exec(path);
  if (m) return { name: "block", category: m[1]!, file: m[2]! };
  if (/^\/components\/?$/.test(path)) return { name: "components" };
  const c = /^\/components\/([\w-]+)\/?$/.exec(path);
  if (c) return { name: "component", component: c[1]! };
  return { name: "not-found" };
}

/**
 * True for a plain primary-button click, the only one an in-app link handles:
 * Ctrl/⌘/Shift/Alt-click and middle-click keep the browser's behaviour (new tab…).
 */
export function isPlainClick(e: MouseEvent): boolean {
  return (
    !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
  );
}
