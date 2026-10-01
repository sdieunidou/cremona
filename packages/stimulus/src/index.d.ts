import type { Application } from "@hotwired/stimulus";
import CremonaVisualController from "./cremona-visual_controller.js";
import CremonaThemeController from "./cremona-theme_controller.js";

export type { CremonaAppearance, CremonaThemeChange } from "./cremona-theme_controller.js";
export { CremonaVisualController, CremonaThemeController };

/** Register `cremona-visual` and `cremona-theme` on a Stimulus application. */
export function registerCremona(application: Application): Application;
