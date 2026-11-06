import { Controller } from "@hotwired/stimulus";

/**
 * cremona-combobox — turns a native <select> into the combobox of @cremona/ui: a text input that
 * filters the options as the user types (case and accents ignored), with the WAI-ARIA combobox
 * pattern. Without JavaScript the <select> works as it is.
 *
 *   <label for="consultant">Consultant</label>
 *   <div data-controller="cremona-combobox" data-cremona-combobox-empty-text-value="No results">
 *     <select id="consultant" name="consultant" data-cremona-combobox-target="select">
 *       <option value="">Any consultant</option>
 *       <option value="12">Alice Martin</option>
 *       <option value="31" data-keywords="EB">Élodie Bernard</option>
 *     </select>
 *   </div>
 *
 * The <select> stays in the form, hidden, and carries the value: the form submits it as before, and
 * every choice dispatches `input` and `change` on it. An option whose value is "" is not listed: its
 * text is the placeholder, and emptying the input chooses it. The input takes the select's labels,
 * `aria-label`, `aria-describedby`, `aria-invalid`, `required` and `disabled`.
 *
 * Values: emptyText (shown and read out when nothing matches, "No results"), placeholder (default:
 * the text of the "" option), size ("default" 36 px or "sm" 32 px).
 * Keys: ↓ / ↑ open the list and move, Home / End jump while it is open, Enter chooses, Escape closes
 * and puts back the chosen label. Leaving the input chooses an option whose label was typed in full,
 * clears the value when the input was emptied, and otherwise puts back the chosen label.
 * Event: `cremona-combobox:change` ({ value, label }) on the controller element.
 * A `multiple` select is left as it is.
 */
export default class CremonaComboboxController extends Controller {
  static targets = ["select"];
  static values = {
    emptyText: { type: String, default: "No results" },
    placeholder: String,
    size: { type: String, default: "default" },
  };

  connect() {
    const select = this.hasSelectTarget ? this.selectTarget : this.element.querySelector("select");
    if (!select || select.multiple) return;
    this.select = select;
    this.base = select.id || `cremona-combobox-${++sequence}`;
    this.options = [...select.options]
      .filter((option) => option.value !== "")
      .map((option, index) => ({
        value: option.value,
        label: option.text.trim(),
        disabled: option.disabled || option.parentElement?.disabled === true,
        text: normalize(`${option.text} ${option.dataset.keywords ?? ""}`),
        id: `${this.base}-option-${index}`,
      }));
    this.query = null;
    this.active = null;
    this.build();
    this.saved = { display: select.style.display, required: select.required };
    display(select, false);
    select.required = false;
    this.listen();
    this.render();
  }

  disconnect() {
    if (!this.select) return;
    this.close();
    this.cleanup?.();
    this.root.remove();
    for (const label of this.namedLabels) label.removeAttribute("id");
    this.select.style.display = this.saved.display;
    this.select.required = this.saved.required;
    this.select = null;
  }

  emptyTextValueChanged() {
    if (this.empty) this.empty.textContent = this.emptyTextValue;
  }

  build() {
    const select = this.select;
    const root = element("div", ROOT);
    root.dataset.slot = "combobox";
    root.dataset.size = this.sizeValue === "sm" ? "sm" : "default";

    const input = element("input", INPUT);
    Object.assign(input, { type: "text", autocomplete: "off", id: `${this.base}-input` });
    input.dataset.slot = "combobox-input";
    attributes(input, { role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false" });
    input.placeholder =
      this.placeholderValue || [...select.options].find((o) => o.value === "")?.text.trim() || "";
    input.disabled = select.disabled;
    input.required = select.required;
    for (const name of ["aria-label", "aria-describedby", "aria-invalid"])
      if (select.hasAttribute(name)) input.setAttribute(name, select.getAttribute(name));
    if (select.classList.contains("is-invalid")) input.setAttribute("aria-invalid", "true");

    this.namedLabels = [];
    const labels = [...(select.labels ?? [])];
    const labelledBy = [
      select.getAttribute("aria-labelledby"),
      ...labels.map((label) => {
        if (!label.id) {
          label.id = `${this.base}-label-${this.namedLabels.length}`;
          this.namedLabels.push(label);
        }
        return label.id;
      }),
    ].filter(Boolean);
    if (labelledBy.length) input.setAttribute("aria-labelledby", labelledBy.join(" "));
    this.labels = labels;

    const list = element("div", LIST);
    list.id = `${this.base}-listbox`;
    list.dataset.slot = "combobox-content";
    list.setAttribute("role", "listbox");
    if (labelledBy.length) list.setAttribute("aria-labelledby", labelledBy.join(" "));
    else if (input.hasAttribute("aria-label"))
      list.setAttribute("aria-label", input.getAttribute("aria-label"));
    this.popover = typeof list.showPopover === "function";
    if (this.popover) list.setAttribute("popover", "manual");
    else display(list, false);

    for (const option of this.options) {
      const item = element("div", ITEM);
      item.id = option.id;
      item.dataset.slot = "combobox-item";
      item.dataset.value = option.value;
      item.setAttribute("role", "option");
      if (option.disabled) {
        item.setAttribute("aria-disabled", "true");
        item.dataset.disabled = "";
      }
      item.textContent = option.label;
      option.element = item;
      list.append(item);
    }
    this.empty = element("div", EMPTY);
    this.empty.dataset.slot = "combobox-empty";
    this.empty.setAttribute("aria-hidden", "true");
    this.empty.textContent = this.emptyTextValue;
    list.append(this.empty);

    this.check = icon("M20 6 9 17l-5-5", CHECK);
    this.status = element("span", "sr-only");
    this.status.setAttribute("role", "status");
    root.append(input, icon("m6 9 6 6 6-6", CHEVRON), this.status, list);
    select.after(root);
    Object.assign(this, { root, input, list });
  }

  listen() {
    const { input, list, select } = this;
    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      return () => target.removeEventListener(type, handler, options);
    };
    const reposition = () => this.isOpen && this.position();
    const sync = () => {
      if (!this.choosing) this.render();
    };
    const offs = [
      on(input, "input", () => this.type()),
      on(input, "keydown", (event) => this.key(event)),
      on(input, "click", () => !this.isOpen && this.open("selected")),
      on(input, "blur", () => this.commit()),
      on(list, "pointerdown", (event) => event.preventDefault()),
      on(list, "click", (event) => {
        const option = this.optionOf(event.target);
        if (option) this.choose(option);
      }),
      on(list, "pointermove", (event) => {
        const option = this.optionOf(event.target);
        if (option && !option.disabled && option !== this.active) this.highlight(option);
      }),
      on(select, "change", sync),
      on(window, "scroll", reposition, { capture: true, passive: true }),
      on(window, "resize", reposition),
      ...this.labels.map((label) =>
        on(label, "click", (event) => {
          event.preventDefault();
          input.focus();
        }),
      ),
    ];
    if (select.form) offs.push(on(select.form, "reset", () => setTimeout(sync)));
    this.cleanup = () => offs.forEach((off) => off());
  }

  get selected() {
    return this.options.find((option) => option.value === this.select.value) ?? null;
  }

  get matches() {
    if (this.query === null) return this.options;
    const words = normalize(this.query).split(/\s+/).filter(Boolean);
    return this.options.filter((option) => words.every((word) => option.text.includes(word)));
  }

  get enabled() {
    return this.matches.filter((option) => !option.disabled);
  }

  optionOf(target) {
    const item = target instanceof Element ? target.closest("[role=option]") : null;
    return this.options.find((option) => option.element === item) ?? null;
  }

  type() {
    this.query = this.input.value;
    this.isOpen = true;
    this.active = this.query.trim() ? (this.enabled[0] ?? null) : null;
    this.render();
  }

  key(event) {
    if (event.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!this.isOpen) this.open("selected");
        else if (!event.altKey) this.move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!this.isOpen) this.open(this.selected ? "selected" : "last");
        else if (event.altKey) this.close();
        else this.move(-1);
        break;
      case "Home":
      case "End":
        if (!this.isOpen || event.shiftKey) return;
        event.preventDefault();
        this.highlight(event.key === "Home" ? this.enabled[0] : this.enabled.at(-1));
        break;
      case "Enter":
        if (!this.isOpen) return;
        event.preventDefault();
        if (this.active) this.choose(this.active);
        else this.close();
        break;
      case "Escape":
        if (!this.isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
    }
  }

  open(at) {
    if (this.input.disabled || this.input.readOnly) return;
    this.isOpen = true;
    const enabled = this.enabled;
    const chosen = enabled.find((option) => option.value === this.select.value);
    this.active = at === "last" ? enabled.at(-1) : (chosen ?? enabled[0] ?? null);
    this.render();
  }

  close() {
    this.isOpen = false;
    this.query = null;
    this.active = null;
    this.render();
  }

  move(step) {
    const enabled = this.enabled;
    const position = enabled.indexOf(this.active);
    const next =
      position === -1
        ? step === 1
          ? enabled[0]
          : enabled.at(-1)
        : enabled[Math.min(Math.max(position + step, 0), enabled.length - 1)];
    this.highlight(next);
  }

  highlight(option) {
    this.active = option ?? null;
    this.render();
  }

  choose(option) {
    if (option.disabled) return;
    this.set(option.value);
    this.close();
  }

  /** Leaving the input: a label typed in full chooses its option, an empty input clears the value. */
  commit() {
    if (this.query !== null) {
      const typed = normalize(this.query.trim());
      if (!typed) this.set("");
      else {
        const exact = this.options.find((o) => !o.disabled && normalize(o.label) === typed);
        if (exact) this.set(exact.value);
      }
    }
    this.close();
  }

  set(value) {
    if (this.select.value === value) return;
    this.select.value = value;
    this.choosing = true;
    this.select.dispatchEvent(new Event("input", { bubbles: true }));
    this.select.dispatchEvent(new Event("change", { bubbles: true }));
    this.choosing = false;
    this.dispatch("change", { detail: { value, label: this.selected?.label ?? "" } });
  }

  render() {
    const { input, list, status, empty } = this;
    const open = !!this.isOpen;
    const selected = this.selected;
    if (this.query === null) input.value = selected?.label ?? "";
    input.setAttribute("aria-expanded", String(open));
    toggle(input, "aria-controls", open ? list.id : null);
    toggle(input, "aria-activedescendant", open && this.active ? this.active.id : null);

    const matches = new Set(this.matches);
    for (const option of this.options) {
      const item = option.element;
      display(item, matches.has(option));
      item.setAttribute("aria-selected", String(option === selected));
      if (option === this.active) item.dataset.highlighted = "";
      else delete item.dataset.highlighted;
    }
    if (selected) selected.element.append(this.check);
    else this.check.remove();
    display(empty, matches.size === 0);
    status.textContent = open && matches.size === 0 ? this.emptyTextValue : "";

    if (open) {
      if (this.popover) {
        if (!list.matches(":popover-open")) list.showPopover();
      } else display(list, true);
      this.position();
      this.active?.element.scrollIntoView?.({ block: "nearest" });
    } else if (this.popover) {
      if (list.matches(":popover-open")) list.hidePopover();
    } else display(list, false);
  }

  /** Below the input, or above it when there is more room there; never taller than that room. */
  position() {
    const { input, list } = this;
    const box = input.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const below = window.innerHeight - box.bottom - gap - margin;
    const above = box.top - gap - margin;
    const wanted = Math.min(MAX_HEIGHT, list.scrollHeight);
    const side = below >= wanted || below >= above ? "bottom" : "top";
    const width = Math.min(box.width, window.innerWidth - 2 * margin);
    Object.assign(list.style, {
      position: "fixed",
      inset: "auto",
      margin: "0",
      width: `${width}px`,
      maxHeight: `${Math.max(0, Math.min(MAX_HEIGHT, side === "bottom" ? below : above))}px`,
      left: `${Math.max(margin, Math.min(box.left, window.innerWidth - margin - width))}px`,
    });
    list.style.top =
      side === "bottom" ? `${box.bottom + gap}px` : `${box.top - gap - list.offsetHeight}px`;
    list.dataset.side = side;
  }
}

let sequence = 0;
const MAX_HEIGHT = 288;

/** The class strings of @cremona/ui's combobox (packages/ui/src/combobox.tsx). */
const ROOT = "group/combobox relative w-full";
const INPUT = [
  "w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-8 pl-2.5 text-base shadow-xs transition-[color,box-shadow] md:text-sm dark:bg-input/30",
  "group-data-[size=default]/combobox:h-9 group-data-[size=sm]/combobox:h-8",
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
].join(" ");
const CHEVRON =
  "pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground";
const LIST = [
  "z-50 overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
].join(" ");
const ITEM = [
  "relative flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
].join(" ");
const CHECK = "absolute right-2 size-4 text-muted-foreground";
const EMPTY = "py-6 text-center text-sm text-muted-foreground";

/** Lower case, without accents: "Élodie" is found by "elo". */
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function element(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function attributes(node, values) {
  for (const [name, value] of Object.entries(values)) node.setAttribute(name, value);
}

/** Through the CSSOM: a `hidden` attribute loses to `flex` on a page without Tailwind's preflight. */
function display(node, visible) {
  node.style.display = visible ? "" : "none";
}

function toggle(node, name, value) {
  if (value === null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}

/** A 24 × 24 lucide icon of one path, hidden from assistive technology. */
function icon(path, className) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  attributes(svg, {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    class: className,
  });
  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", path);
  svg.append(line);
  return svg;
}
