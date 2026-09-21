/** Theme + appearance state (localStorage-persisted, POC-faithful behavior). */
import { useCallback, useEffect, useState } from "react";

export type Appearance = "light" | "dark" | "system";

const APPEARANCE_KEY = "cremona-appearance";
const THEME_KEY = "cremona-theme";

export function readAppearance(): Appearance {
  return (localStorage.getItem(APPEARANCE_KEY) as Appearance) || "system";
}

export function readTheme(): string {
  return localStorage.getItem(THEME_KEY) || "default";
}

export function useTheme() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  const [theme, setTheme] = useState<string>(readTheme);

  const apply = useCallback(
    (appearance: Appearance, theme: string) => {
      const root = document.documentElement;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = appearance === "dark" || (appearance === "system" && prefersDark);
      root.classList.toggle("dark", dark);
      for (const c of [...root.classList]) if (c.startsWith("theme-")) root.classList.remove(c);
      if (theme !== "default") root.classList.add(`theme-${theme}`);
      root.style.colorScheme = dark ? "dark" : "light";
    },
    [],
  );

  useEffect(() => {
    apply(appearance, theme);
  }, [appearance, theme, apply]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(readAppearance(), readTheme());
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [apply]);

  const updateAppearance = useCallback((next: Appearance) => {
    localStorage.setItem(APPEARANCE_KEY, next);
    setAppearance(next);
  }, []);

  const updateTheme = useCallback((next: string) => {
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  }, []);

  const isDark =
    appearance === "dark" ||
    (appearance === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleDark = useCallback(() => {
    updateAppearance(isDark ? "light" : "dark");
  }, [isDark, updateAppearance]);

  return { appearance, theme, isDark, updateAppearance, updateTheme, toggleDark };
}
