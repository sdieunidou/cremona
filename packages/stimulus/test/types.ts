// Type-checked by `pnpm typecheck` (not run): the declarations describe the controllers' public API.
import { Application } from "@hotwired/stimulus";
import {
  registerCremona,
  CremonaThemeController,
  CremonaVisualController,
  CremonaComboboxController,
  type CremonaComboboxChange,
  type CremonaThemeChange,
} from "../src/index.js";

const app: Application = registerCremona(Application.start());
app.register("cremona-visual-copy", CremonaVisualController);

export function onChanged(event: CustomEvent<CremonaThemeChange>): string {
  return `${event.detail.appearance} ${event.detail.theme} ${event.detail.dark}`;
}

export function themeOf(controller: CremonaThemeController): string {
  controller.setTheme({ params: { theme: "sakura" } });
  return controller.themeValue;
}

export function onComboboxChange(event: CustomEvent<CremonaComboboxChange>): string {
  return `${event.detail.value} ${event.detail.label}`;
}

export function selectOf(controller: CremonaComboboxController): HTMLSelectElement {
  return controller.selectTarget;
}
