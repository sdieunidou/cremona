import { Controller } from "@hotwired/stimulus";

/** Detail of the `cremona-combobox:change` event, dispatched once per choice. */
export interface CremonaComboboxChange {
  /** The value of the chosen option, `""` when the input was emptied. */
  value: string;
  /** Its label, `""` when nothing is chosen. */
  label: string;
}

/**
 * `data-controller="cremona-combobox"` around a native `<select>` (its `select` target, or the first
 * `<select>` inside): the select stays in the form, hidden, and a text input that filters its options
 * takes its place.
 */
export default class CremonaComboboxController extends Controller<HTMLElement> {
  static targets: string[];
  static values: {
    emptyText: { type: StringConstructor; default: string };
    placeholder: StringConstructor;
    size: { type: StringConstructor; default: string };
  };
  readonly selectTarget: HTMLSelectElement;
  readonly hasSelectTarget: boolean;
  /** Shown in the list and read out when nothing matches. Default "No results". */
  emptyTextValue: string;
  /** The placeholder of the input. Default: the text of the select's option whose value is `""`. */
  placeholderValue: string;
  /** `"default"` (36 px) or `"sm"` (32 px). */
  sizeValue: "default" | "sm" | string;
}
