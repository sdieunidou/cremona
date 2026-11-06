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
 * `cremona-combobox` turns a native <select> into a filtering combobox.
 *
 * Then use the templates from @cremona/stimulus/templates/<category>/<file>/<slug>.html
 * (index: @cremona/stimulus/templates/manifest.json) and the CSS from @cremona/tokens.
 */
import CremonaVisualController from "./cremona-visual_controller.js";
import CremonaThemeController from "./cremona-theme_controller.js";
import CremonaComboboxController from "./cremona-combobox_controller.js";

export { CremonaVisualController, CremonaThemeController, CremonaComboboxController };

export function registerCremona(application) {
  application.register("cremona-visual", CremonaVisualController);
  application.register("cremona-theme", CremonaThemeController);
  application.register("cremona-combobox", CremonaComboboxController);
  return application;
}
