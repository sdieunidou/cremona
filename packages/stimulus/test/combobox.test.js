/** Behaviour of cremona-combobox on real Stimulus, around a server-rendered <select>. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "../src/index.js";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

let app;
async function start(markup) {
  document.body.innerHTML = markup;
  app = registerCremona(Application.start());
  await tick();
}
afterEach(() => {
  app?.unload("cremona-combobox");
  app?.stop();
  app = undefined;
  document.body.innerHTML = "";
});

const SELECT = `
  <form>
    <label for="consultant">Consultant</label>
    <div data-controller="cremona-combobox" data-cremona-combobox-empty-text-value="Nobody found">
      <select id="consultant" name="consultant" class="form-select" aria-describedby="help" required
        data-cremona-combobox-target="select">
        <option value="">Any consultant</option>
        <option value="1">Alice Martin</option>
        <option value="2">Bruno Lefèvre</option>
        <option value="3" disabled>Céline Dubois</option>
        <option value="4" data-keywords="EB">Élodie Bernard</option>
        <option value="5">Marc Durand</option>
      </select>
    </div>
    <p id="help">Type a name.</p>
    <button type="submit">Filter</button>
  </form>`;

const input = () => document.querySelector("[role=combobox]");
const list = () => document.querySelector("[role=listbox]");
const select = () => document.querySelector("select");
const shown = (node) => node.style.display !== "none";
const visibleOptions = () =>
  [...list().querySelectorAll("[role=option]")].filter(shown).map((o) => o.textContent);
const option = (label) =>
  [...list().querySelectorAll("[role=option]")].find((o) => o.textContent === label);
const press = (key, init = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  input().dispatchEvent(event);
  return event;
};
const type = (text) => {
  input().value = text;
  input().dispatchEvent(new Event("input", { bubbles: true }));
};
const blur = () => input().dispatchEvent(new FocusEvent("blur"));

describe("cremona-combobox", () => {
  it("hides the select and puts a labelled, described combobox in its place", async () => {
    await start(SELECT);
    expect(select().style.display).toBe("none");
    expect(select().required).toBe(false);
    const box = input();
    expect(box.getAttribute("aria-expanded")).toBe("false");
    expect(box.getAttribute("aria-autocomplete")).toBe("list");
    expect(box.getAttribute("autocomplete")).toBe("off");
    expect(box.hasAttribute("aria-controls")).toBe(false);
    expect(box.required).toBe(true);
    expect(box.placeholder).toBe("Any consultant");
    expect(box.getAttribute("aria-describedby")).toBe("help");
    const label = document.querySelector("label");
    expect(box.getAttribute("aria-labelledby")).toBe(label.id);
    expect(list().getAttribute("aria-labelledby")).toBe(label.id);
    expect(box.value).toBe("");
    expect(shown(list())).toBe(false);
    expect([...list().querySelectorAll("[role=option]")].map((o) => o.textContent)).toEqual([
      "Alice Martin",
      "Bruno Lefèvre",
      "Céline Dubois",
      "Élodie Bernard",
      "Marc Durand",
    ]);
    expect(option("Céline Dubois").getAttribute("aria-disabled")).toBe("true");
  });

  it("shows the selected option's label", async () => {
    // happy-dom ignores `selected` on a later option of parsed markup: select it before connecting
    await start(SELECT.replace('data-controller="cremona-combobox"', ""));
    select().value = "5";
    select().parentElement.dataset.controller = "cremona-combobox";
    await tick();
    expect(input().value).toBe("Marc Durand");
    expect(option("Marc Durand").getAttribute("aria-selected")).toBe("true");
  });

  it("filters as the user types, ignoring case and accents, and by keywords", async () => {
    await start(SELECT);
    type("ELO");
    expect(input().getAttribute("aria-expanded")).toBe("true");
    expect(input().getAttribute("aria-controls")).toBe(list().id);
    expect(shown(list())).toBe(true);
    expect(visibleOptions()).toEqual(["Élodie Bernard"]);
    type("mar d");
    expect(visibleOptions()).toEqual(["Marc Durand"]);
    type("eb");
    expect(visibleOptions()).toEqual(["Élodie Bernard"]);
  });

  it("highlights the first match, moves with the arrows and chooses with Enter", async () => {
    await start(SELECT);
    const change = vi.fn();
    const changed = vi.fn();
    select().addEventListener("change", change);
    document.addEventListener("cremona-combobox:change", (event) => changed(event.detail));
    type("r");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Alice Martin").id);
    expect(option("Alice Martin").hasAttribute("data-highlighted")).toBe(true);
    press("ArrowDown");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Bruno Lefèvre").id);
    const enter = press("Enter");
    expect(enter.defaultPrevented).toBe(true);
    expect(select().value).toBe("2");
    expect(input().value).toBe("Bruno Lefèvre");
    expect(input().getAttribute("aria-expanded")).toBe("false");
    expect(input().hasAttribute("aria-activedescendant")).toBe(false);
    expect(shown(list())).toBe(false);
    expect(change).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ value: "2", label: "Bruno Lefèvre" });
  });

  it("opens with the arrow keys, skips disabled options, stops at both ends, Home and End", async () => {
    await start(SELECT);
    press("ArrowDown");
    expect(input().getAttribute("aria-expanded")).toBe("true");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Alice Martin").id);
    press("ArrowDown");
    press("ArrowDown");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Élodie Bernard").id);
    press("ArrowDown");
    press("ArrowDown");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Marc Durand").id);
    expect(press("Home").defaultPrevented).toBe(true);
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Alice Martin").id);
    press("ArrowUp");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Alice Martin").id);
    press("End");
    expect(input().getAttribute("aria-activedescendant")).toBe(option("Marc Durand").id);
  });

  it("leaves Home, End and Enter to the input and the form while the list is closed", async () => {
    await start(SELECT);
    expect(press("Home").defaultPrevented).toBe(false);
    expect(press("End").defaultPrevented).toBe(false);
    expect(press("Enter").defaultPrevented).toBe(false);
    expect(press("Escape").defaultPrevented).toBe(false);
  });

  it("closes on Escape, puts back the chosen label and keeps the Escape from a dialog", async () => {
    await start(SELECT.replace('<option value="1">', '<option value="1" selected>'));
    const outer = vi.fn();
    document.body.addEventListener("keydown", outer);
    type("mar");
    const escape = press("Escape");
    expect(escape.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(input().value).toBe("Alice Martin");
    expect(select().value).toBe("1");
    expect(shown(list())).toBe(false);
  });

  it("chooses with a click, and never a disabled option", async () => {
    await start(SELECT);
    input().click();
    expect(shown(list())).toBe(true);
    const down = new Event("pointerdown", { bubbles: true, cancelable: true });
    option("Marc Durand").dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    option("Marc Durand").click();
    expect(select().value).toBe("5");
    expect(input().value).toBe("Marc Durand");
    input().click();
    option("Céline Dubois").click();
    expect(select().value).toBe("5");
  });

  it("shows and announces a message when nothing matches", async () => {
    await start(SELECT);
    const status = document.querySelector("[role=status]");
    type("zz");
    expect(visibleOptions()).toEqual([]);
    expect(shown(document.querySelector("[data-slot=combobox-empty]"))).toBe(true);
    expect(status.textContent).toBe("Nobody found");
    press("Enter");
    expect(shown(list())).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("on leaving, chooses a label typed in full, clears an emptied input, reverts the rest", async () => {
    await start(SELECT.replace('<option value="1">', '<option value="1" selected>'));
    type("marc durand");
    blur();
    expect(select().value).toBe("5");
    expect(input().value).toBe("Marc Durand");
    type("");
    blur();
    expect(select().value).toBe("");
    expect(input().value).toBe("");
    type("ali");
    blur();
    expect(select().value).toBe("");
    expect(input().value).toBe("");
  });

  it("submits the value through the select", async () => {
    await start(SELECT);
    type("bru");
    press("Enter");
    const data = new FormData(document.querySelector("form"));
    expect(data.get("consultant")).toBe("2");
    expect([...data.keys()]).toEqual(["consultant"]);
  });

  it("follows a change made to the select, and a form reset", async () => {
    await start(SELECT);
    select().value = "4";
    select().dispatchEvent(new Event("change", { bubbles: true }));
    expect(input().value).toBe("Élodie Bernard");
    document.querySelector("form").reset();
    await tick();
    expect(input().value).toBe("");
  });

  it("focuses the input from the label", async () => {
    await start(SELECT);
    document.querySelector("label").click();
    expect(document.activeElement).toBe(input());
  });

  it("does not open when the select is disabled", async () => {
    await start(SELECT.replace("required", "required disabled"));
    expect(input().disabled).toBe(true);
    press("ArrowDown");
    expect(input().getAttribute("aria-expanded")).toBe("false");
  });

  it("takes an aria-label, aria-invalid, a placeholder and a size", async () => {
    await start(`
      <div data-controller="cremona-combobox" data-cremona-combobox-placeholder-value="Search"
        data-cremona-combobox-size-value="sm">
        <select name="client" aria-label="Client" class="is-invalid">
          <option value="acme">Acme</option>
        </select>
      </div>`);
    expect(input().getAttribute("aria-label")).toBe("Client");
    expect(list().getAttribute("aria-label")).toBe("Client");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().placeholder).toBe("Search");
    expect(document.querySelector("[data-slot=combobox]").dataset.size).toBe("sm");
    expect(input().value).toBe("Acme");
  });

  it("leaves a multiple select as it is", async () => {
    await start(`
      <div data-controller="cremona-combobox">
        <select name="tags" multiple aria-label="Tags"><option>a</option></select>
      </div>`);
    expect(input()).toBeNull();
    expect(select().style.display).toBe("");
  });

  it("restores the select when it disconnects", async () => {
    await start(SELECT);
    const label = document.querySelector("label");
    document.querySelector("[data-controller]").removeAttribute("data-controller");
    await tick();
    expect(input()).toBeNull();
    expect(list()).toBeNull();
    expect(select().style.display).toBe("");
    expect(select().required).toBe(true);
    expect(label.hasAttribute("id")).toBe(false);
  });
});
