import { Controller } from "@hotwired/stimulus";

export type CremonaAppearance = "light" | "dark" | "system";

/** Detail of the `cremona-theme:changed` event, dispatched once per actual change. */
export interface CremonaThemeChange {
  appearance: CremonaAppearance;
  theme: string;
  dark: boolean;
}

/**
 * `data-controller="cremona-theme"` (on `<html>`): applies `.dark`, `.theme-<name>` and
 * `color-scheme`, remembers the choice in localStorage and follows `prefers-color-scheme`.
 */
export default class CremonaThemeController extends Controller<HTMLElement> {
  static values: {
    appearance: { type: StringConstructor; default: string };
    theme: { type: StringConstructor; default: string };
    storageKey: { type: StringConstructor; default: string };
    themeStorageKey: { type: StringConstructor; default: string };
  };
  appearanceValue: CremonaAppearance;
  /** A theme of `@cremona/tokens` (`themes.json`), or `default`. */
  themeValue: string;
  /** localStorage key of the appearance; `""` turns storage off. */
  storageKeyValue: string;
  /** localStorage key of the theme; `""` turns storage off. */
  themeStorageKeyValue: string;
  /** Action: `data-cremona-theme-appearance-param="light|dark|system"`. */
  setAppearance(event: { params: { appearance?: CremonaAppearance } }): void;
  /** Action: `data-cremona-theme-theme-param="<theme>"`. */
  setTheme(event: { params: { theme?: string } }): void;
  /** Action: switch between light and dark. */
  toggle(): void;
}
