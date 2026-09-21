/**
 * @cremona/stimulus — controllers and templates for Symfony / Hotwire apps.
 *
 * Register the controllers with your Stimulus application:
 *
 *   import { Application } from "@hotwired/stimulus";
 *   import { registerCremona } from "@cremona/stimulus";
 *   const app = Application.start();
 *   registerCremona(app);
 *
 * Then use the templates from templates/ (see templates/manifest.json) and the
 * CSS from @cremona/tokens.
 */
import CremonaVisualController from "./cremona-visual_controller.js";
import CremonaThemeController from "./cremona-theme_controller.js";

export { CremonaVisualController, CremonaThemeController };

export function registerCremona(application) {
  application.register("cremona-visual", CremonaVisualController);
  application.register("cremona-theme", CremonaThemeController);
  return application;
}

/** Read the generated template manifest (keys: "category/file"). */
export { default as manifest } from "../templates/manifest.json";
