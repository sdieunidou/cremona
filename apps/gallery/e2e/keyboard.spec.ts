/** Keyboard and screen-reader contracts of the gallery chrome. */
import { test, expect, type Page } from "@playwright/test";

const activeOption = (page: Page) =>
  page.evaluate(() => {
    const input = document.activeElement as HTMLElement | null;
    const id = input?.getAttribute("aria-activedescendant");
    const option = id ? document.getElementById(id) : null;
    return {
      role: input?.getAttribute("role"),
      id,
      selected: option?.getAttribute("aria-selected"),
      name: option?.querySelector("span > span")?.textContent?.trim() ?? "",
    };
  });

test("skip link is the first tab stop and moves focus to the content", async ({ page }) => {
  await page.goto("/");
  await page.locator("h1").waitFor();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Visuals" })).toBeVisible();
});

test("search: combobox + listbox driven by the arrow keys", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search visuals" });
  await trigger.click();

  const input = page.getByRole("combobox", { name: "Search visuals" });
  await expect(input).toBeFocused();
  await expect(page.getByRole("dialog", { name: "Search visuals" })).toBeVisible();
  await input.fill("chart");
  await expect(page.getByRole("listbox").getByRole("option").first()).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/\d+ results?/);

  // the first match is active, ArrowDown/ArrowUp move (and wrap) without leaving the input
  const first = await activeOption(page);
  expect(first).toMatchObject({ role: "combobox", selected: "true" });
  await page.keyboard.press("ArrowDown");
  const second = await activeOption(page);
  expect(second.id).not.toBe(first.id);
  expect(second.selected).toBe("true");
  await page.keyboard.press("ArrowUp");
  expect((await activeOption(page)).id).toBe(first.id);
  await page.keyboard.press("ArrowUp");
  const last = await activeOption(page);
  expect(last.id).not.toBe(first.id);
  await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);

  // focus stays in the dialog: Tab cycles between the input and the close button
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /close search/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();

  // Enter opens the active option
  await page.keyboard.press("ArrowDown");
  const target = await activeOption(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toHaveText(target.name);
  await expect(page.locator("h1")).toBeFocused();
});

test("search: Escape closes and gives focus back", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search visuals" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox")).toBeFocused();
  // the page behind is inert while the dialog is open
  expect(await page.evaluate(() => document.getElementById("root")?.inert)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.getElementById("root")?.inert)).toBe(false);
});

test("theme menu: menuitemradio items, arrow keys, focus return", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Theme and appearance" });
  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const menu = page.getByRole("menu", { name: "Theme and appearance" });
  const light = menu.getByRole("menuitemradio", { name: "Light", exact: true });
  await expect(light).toBeFocused();
  await expect(menu.getByRole("menuitemradio", { name: "System" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(menu.getByRole("menuitemradio", { name: "Default" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  // every item is out of the tab order: the menu is one tab stop
  expect(await menu.locator('[role="menuitemradio"][tabindex="0"]').count()).toBe(0);

  // the focused item is visibly highlighted
  const idle = await menu
    .getByRole("menuitemradio", { name: "Dark" })
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.keyboard.press("ArrowDown");
  const dark = menu.getByRole("menuitemradio", { name: "Dark" });
  await expect(dark).toBeFocused();
  expect(await dark.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(idle);

  // End, Home, type-ahead
  await page.keyboard.press("End");
  await expect(menu.getByRole("menuitemradio", { name: "Brutalism" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(light).toBeFocused();
  await page.keyboard.press("s");
  await expect(menu.getByRole("menuitemradio", { name: "System" })).toBeFocused();
  await page.keyboard.press("s");
  await expect(menu.getByRole("menuitemradio", { name: "Sakura" })).toBeFocused();

  // Enter picks, closes and returns focus to the trigger
  await page.keyboard.press("Enter");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("html")).toHaveClass(/theme-sakura/);

  // reopened, the choice is checked; Escape closes without changing anything
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menu").getByRole("menuitemradio", { name: "Sakura" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("mobile navigation: expanded state, focus, Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sidebar = page.locator('[data-slot="sidebar-container"]');
  await expect(sidebar).toBeHidden();
  const toggle = page.getByRole("button", { name: "Navigation menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await toggle.getAttribute("aria-controls")).toBe(await sidebar.getAttribute("id"));
  await toggle.click();
  await expect(sidebar).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar.getByRole("link", { name: "All visuals" })).toBeFocused();

  // focus stays inside the open navigation
  for (let i = 0; i < 3; i++) await page.keyboard.press("Shift+Tab");
  expect(await sidebar.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();
  await expect(toggle).toBeFocused();

  // the close button inside the panel closes it too
  await toggle.click();
  await sidebar.getByRole("button", { name: "Close navigation" }).click();
  await expect(sidebar).toBeHidden();
});

test("search button has a name on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Search visuals" })).toBeVisible();
});
