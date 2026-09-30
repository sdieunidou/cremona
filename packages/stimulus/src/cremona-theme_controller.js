import { Controller } from "@hotwired/stimulus";

/**
 * cremona-theme — applies the Cremona appearance and theme to <html>.
 *
 *   <html data-controller="cremona-theme" data-cremona-theme-appearance-value="system">
 *
 * Values (render them from the server; changing them at runtime applies at once):
 *   appearance       "light" | "dark" | "system" (follows prefers-color-scheme)
 *   theme            a @cremona/tokens theme: "default", "sakura", …
 *   storageKey       localStorage key of the appearance ("cremona-appearance")
 *   themeStorageKey  localStorage key of the theme ("cremona-theme")
 *
 * A stored choice wins over the rendered values; an empty key turns storage off.
 * Actions: setAppearance (param `appearance`), setTheme (param `theme`), toggle.
 * The controller sets `dark`, `theme-<name>` and `color-scheme` on
 * document.documentElement and dispatches `cremona-theme:changed`
 * ({ appearance, theme, dark }) whenever the result changes.
 */
export default class CremonaThemeController extends Controller {
  static values = {
    appearance: { type: String, default: "system" },
    theme: { type: String, default: "default" },
    storageKey: { type: String, default: "cremona-appearance" },
    themeStorageKey: { type: String, default: "cremona-theme" },
  };

  connect() {
    this.media = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;
    this.onMedia = () => {
      if (this.appearanceValue === "system") this.apply();
    };
    this.media?.addEventListener?.("change", this.onMedia);
    const appearance = read(this.storageKeyValue);
    const theme = read(this.themeStorageKeyValue);
    if (appearance) this.appearanceValue = appearance;
    if (theme) this.themeValue = theme;
    this.live = true;
    this.apply();
  }

  disconnect() {
    this.live = false;
    this.media?.removeEventListener?.("change", this.onMedia);
  }

  appearanceValueChanged() {
    if (this.live) this.apply();
  }

  themeValueChanged() {
    if (this.live) this.apply();
  }

  setAppearance({ params }) {
    if (!params?.appearance) return;
    this.appearanceValue = params.appearance;
    write(this.storageKeyValue, params.appearance);
    this.apply();
  }

  setTheme({ params }) {
    if (!params?.theme) return;
    this.themeValue = params.theme;
    write(this.themeStorageKeyValue, params.theme);
    this.apply();
  }

  toggle() {
    this.setAppearance({
      params: {
        appearance: document.documentElement.classList.contains("dark") ? "light" : "dark",
      },
    });
  }

  apply() {
    const root = document.documentElement;
    const dark =
      this.appearanceValue === "dark" ||
      (this.appearanceValue === "system" && !!this.media?.matches);
    const theme =
      this.themeValue && this.themeValue !== "default" ? `theme-${this.themeValue}` : "";
    root.classList.toggle("dark", dark);
    for (const c of [...root.classList])
      if (c.startsWith("theme-") && c !== theme) root.classList.remove(c);
    if (theme) root.classList.add(theme);
    root.style.colorScheme = dark ? "dark" : "light";
    const state = `${this.appearanceValue} ${this.themeValue} ${dark}`;
    if (state === this.applied) return;
    this.applied = state;
    this.dispatch("changed", {
      detail: { appearance: this.appearanceValue, theme: this.themeValue, dark },
    });
  }
}

// Storage can be unavailable (privacy modes, blocked site data): the choice then lasts for the page.
function read(key) {
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  if (!key) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* not persisted */
  }
}
