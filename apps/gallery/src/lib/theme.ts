/** Theme + appearance state, persisted to localStorage when the browser allows it. */
import { useCallback, useEffect, useState } from "react";
import themes from "@cremona/tokens/themes.json";

export type Appearance = "light" | "dark" | "system";

export interface ThemeMeta {
  value: string;
  label: string;
  class: string | null;
  swatches: string[];
}

export const THEMES: ThemeMeta[] = themes;

export const APPEARANCES: { value: Appearance; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const APPEARANCE_KEY = "cremona-appearance";
const THEME_KEY = "cremona-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// Storage throws when site data is blocked: the choice then lasts for the page.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* not persisted */
  }
}

export function readAppearance(): Appearance {
  const stored = read(APPEARANCE_KEY);
  return APPEARANCES.some((a) => a.value === stored) ? (stored as Appearance) : "system";
}

export function readTheme(): string {
  const stored = read(THEME_KEY);
  return THEMES.some((t) => t.value === stored) ? stored! : "default";
}

function prefersDark(): boolean {
  return window.matchMedia?.(DARK_QUERY).matches ?? false;
}

export function useTheme() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  const [theme, setTheme] = useState<string>(readTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);
  const isDark = appearance === "dark" || (appearance === "system" && systemDark);

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return;
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    for (const c of [...root.classList]) if (c.startsWith("theme-")) root.classList.remove(c);
    if (theme !== "default") root.classList.add(`theme-${theme}`);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark, theme]);

  const updateAppearance = useCallback((next: Appearance) => {
    write(APPEARANCE_KEY, next);
    setAppearance(next);
  }, []);

  const updateTheme = useCallback((next: string) => {
    write(THEME_KEY, next);
    setTheme(next);
  }, []);

  const toggleDark = useCallback(() => {
    updateAppearance(isDark ? "light" : "dark");
  }, [isDark, updateAppearance]);

  return { appearance, theme, isDark, updateAppearance, updateTheme, toggleDark };
}
