import { Controller } from "@hotwired/stimulus";

/**
 * cremona-theme — applies the Cremona design system to <html>.
 *
 * Mount on the <html> element (or any ancestor of your app):
 *
 *   <html data-controller="cremona-theme" data-cremona-theme-appearance-value="system">
 *
 * Values:
 *   appearance: "light" | "dark" | "system"  (persisted to localStorage)
 *   theme:     one of @cremona/tokens themes.json values (default, claude-plus, …)
 *
 * The controller toggles the `dark` class and the `.theme-<name>` class on
 * document.documentElement — exactly like the POC.
 */
export default class CremonaThemeController extends Controller {
  static values = {
    appearance: { type: String, default: "system" },
    theme: { type: String, default: "default" },
    storageKey: { type: String, default: "cremona-appearance" },
    themeStorageKey: { type: String, default: "cremona-theme" },
  };

  connect() {
    this.appearanceValue = localStorage.getItem(this.storageKeyValue) ?? this.appearanceValue;
    this.themeValue = localStorage.getItem(this.themeStorageKeyValue) ?? this.themeValue;
    this.apply();
    this.media = window.matchMedia("(prefers-color-scheme: dark)");
    this.onMedia = () => {
      if (this.appearanceValue === "system") this.apply();
    };
    this.media.addEventListener("change", this.onMedia);
  }

  disconnect() {
    this.media?.removeEventListener("change", this.onMedia);
  }

  appearanceChanged({ params }) {
    if (params?.appearance) {
      this.appearanceValue = params.appearance;
      localStorage.setItem(this.storageKeyValue, this.appearanceValue);
      this.apply();
    }
  }

  themeChanged({ params }) {
    if (params?.theme) {
      this.themeValue = params.theme;
      localStorage.setItem(this.themeStorageKey, this.themeValue);
      this.apply();
    }
  }

  toggle() {
    const dark = document.documentElement.classList.contains("dark");
    this.appearanceValue = dark ? "light" : "dark";
    localStorage.setItem(this.storageKeyValue, this.appearanceValue);
    this.apply();
  }

  apply() {
    const root = document.documentElement;
    const prefersDark = this.media ? this.media.matches : false;
    const dark = this.appearanceValue === "dark" || (this.appearanceValue === "system" && prefersDark);
    root.classList.toggle("dark", dark);
    for (const c of [...root.classList]) {
      if (c.startsWith("theme-")) root.classList.remove(c);
    }
    if (this.themeValue && this.themeValue !== "default") {
      root.classList.add(`theme-${this.themeValue}`);
    }
    root.style.colorScheme = dark ? "dark" : "light";
    this.dispatch("changed", { detail: { appearance: this.appearanceValue, theme: this.themeValue, dark } });
  }
}
