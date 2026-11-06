import type { Application } from "@hotwired/stimulus";
import CremonaVisualController from "./cremona-visual_controller.js";
import CremonaThemeController from "./cremona-theme_controller.js";
import CremonaComboboxController from "./cremona-combobox_controller.js";

export type { CremonaAppearance, CremonaThemeChange } from "./cremona-theme_controller.js";
export type { CremonaComboboxChange } from "./cremona-combobox_controller.js";
export { CremonaVisualController, CremonaThemeController, CremonaComboboxController };

/** Register `cremona-visual`, `cremona-theme` and `cremona-combobox` on a Stimulus application. */
export function registerCremona(application: Application): Application;
