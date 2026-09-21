/** Tiny history router (no dependency). */
import { useCallback, useEffect, useState } from "react";

export function useRoute(): [string, (to: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return [path, navigate];
}

/** Route parser: "/" | "/visuals/<category>/<file>". */
export function parseRoute(path: string): { name: "home" } | { name: "block"; category: string; file: string } {
  const m = /^\/visuals\/([\w-]+)\/([\w-]+)\/?$/.exec(path);
  if (m) return { name: "block", category: m[1]!, file: m[2]! };
  return { name: "home" };
}
