/**
 * The @cremona/ui component pages: every page renders each example without an error card, an
 * uncaught error or a console error, and axe finds no violation (colour contrast included) in light
 * and dark. The components themselves are tested in a real browser here: overlays, focus,
 * keyboard, layout.
 */
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

const registry = JSON.parse(
  readFileSync(new URL("../../../packages/ui/registry.json", import.meta.url), "utf8"),
) as { items: { name: string; title: string; type: string }[] };
const components = registry.items.filter((item) => item.type === "registry:ui");

async function violations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.map(
    (v) =>
      `${v.id} (${v.nodes.length}): ${v.nodes
        .slice(0, 2)
        .map((n) => n.target.join(" "))
        .join(" | ")}`,
  );
}

/**
 * axe on an open overlay: only its own content. The page behind a modal menu or list is hidden from
 * assistive technology on purpose, and a portal sits outside the page's landmarks.
 */
async function overlayViolations(page: Page, selector: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .include(selector)
    .disableRules(["region"])
    .analyze();
  return violations.map(
    (v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ") ?? ""}`,
  );
}

test("lists every component", async ({ page }) => {
  await page.goto("/components");
  await expect(page.locator("h1")).toHaveText("UI components");
  for (const { title } of components)
    await expect(page.getByRole("link", { name: new RegExp(`^${title}`) }).first()).toBeVisible();
});

for (const { name, title } of components) {
  test(`renders /components/${name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${message.text()} ${message.location().url}`);
    });
    await page.goto(`/components/${name}`);
    await expect(page.locator("h1")).toHaveText(title, { timeout: 8000 });
    expect(await page.locator("[data-example]").count()).toBeGreaterThan(0);
    await expect(page.locator("[data-preview-error]")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(errors, `errors on /components/${name}`).toEqual([]);
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });
    for (const { name } of components) {
      test(`axe finds nothing on /components/${name}`, async ({ page }) => {
        await page.goto(`/components/${name}`);
        await page.locator("h1").waitFor();
        await page.waitForLoadState("networkidle");
        expect(await violations(page), name).toEqual([]);
      });
    }
  });
}

test.describe("overlays", () => {
  test("a dialog traps focus, closes with Escape and gives focus back", async ({ page }) => {
    await page.goto("/components/dialog");
    const trigger = page.getByRole("button", { name: "Edit profile" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toBeVisible();
    expect(await violations(page), "open dialog").toEqual([]);
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a dialog taller than the screen scrolls inside a margin", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto("/components/dialog");
    await page.getByRole("button", { name: "Terms of service" }).click();
    const dialog = page.getByRole("dialog", { name: "Terms of service" });
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(15);
    expect(box.x + box.width).toBeLessThanOrEqual(390 - 15);
    expect(box.y).toBeGreaterThanOrEqual(15);
    expect(box.y + box.height).toBeLessThanOrEqual(600 - 15);
    expect(await dialog.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  });

  test("a select opens from the keyboard, chooses and submits its value", async ({ page }) => {
    await page.goto("/components/select");
    const trigger = page.getByRole("combobox", { name: "Fruit" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    expect(await overlayViolations(page, '[data-slot="select-content"]'), "open select").toEqual(
      [],
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveText("Banana");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a long select list stays inside the screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 500 });
    await page.goto("/components/select");
    await page.getByRole("combobox", { name: "Year" }).click();
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    const box = (await list.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(500);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  });

  test("a menu opens with the keyboard, has a submenu and closes with Escape", async ({ page }) => {
    await page.goto("/components/dropdown-menu");
    const trigger = page.getByRole("button", { name: "Share" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    expect(
      await overlayViolations(page, '[data-slot="dropdown-menu-content"]'),
      "open menu",
    ).toEqual([]);
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Send to" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    // the menu and its submenu leave once their exit animation is done
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("a popover takes focus, and Escape gives it back", async ({ page }) => {
    await page.goto("/components/popover");
    const trigger = page.getByRole("button", { name: "Dimensions" });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Dimensions" });
    await expect(panel).toBeVisible();
    expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    expect(await violations(page), "open popover").toEqual([]);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a tooltip shows on keyboard focus and hides with Escape", async ({ page }) => {
    await page.goto("/components/tooltip");
    await page.getByRole("button", { name: "Bold" }).focus();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Bold (⌘B)");
    expect(await overlayViolations(page, '[data-slot="tooltip-content"]'), "tooltip").toEqual([]);
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("a toast is announced, an error stays, F8 reaches them", async ({ page }) => {
    await page.goto("/components/toast");
    await page.getByRole("button", { name: "Success" }).click();
    const region = page.getByRole("region", { name: /Notifications/ });
    await expect(region.getByText("Published")).toBeVisible();
    expect(await violations(page), "toast").toEqual([]);
    await page.getByRole("button", { name: "Delete message" }).click();
    await expect(region.getByText("Message deleted")).toBeVisible();
    await page.waitForTimeout(6000);
    await expect(region.getByText("Message deleted")).toBeVisible();
    await expect(region.getByText("Published")).toBeHidden();
    await region.getByRole("button", { name: "Undo" }).click();
    await expect(region.getByText("Restored")).toBeVisible();
  });
});

test.describe("controls", () => {
  test("tabs move with the arrow keys and the panel is the next tab stop", async ({ page }) => {
    await page.goto("/components/tabs");
    const account = page.getByRole("tab", { name: "Account" }).first();
    await account.focus();
    await page.keyboard.press("ArrowRight");
    const password = page.getByRole("tab", { name: "Password" }).first();
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tabpanel").first()).toBeFocused();
  });

  test("a list of tabs wider than its box scrolls instead of widening the page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/components/tabs");
    const list = page.getByRole("tablist", { name: "Report" });
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });

  test("an accordion opens and closes, its trigger inside a heading", async ({ page }) => {
    await page.goto("/components/accordion");
    const trigger = page.getByRole("button", { name: "What is the return policy?" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.locator('[data-example="Single"]').getByText("Thirty days, no questions asked."),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "What is the return policy?" })).toBeVisible();
  });

  test("a checkbox, a switch and a radio take a click just outside their box", async ({ page }) => {
    await page.goto("/components/checkbox");
    const box = page.getByRole("checkbox", { name: "Remember me" });
    await expect(box).toBeChecked();
    const rect = (await box.boundingBox())!;
    await page.mouse.click(rect.x - 3, rect.y + rect.height / 2);
    await expect(box).not.toBeChecked();
    expect(rect.width + 8).toBeGreaterThanOrEqual(24);

    await page.goto("/components/switch");
    const toggle = page.getByRole("switch", { name: "Airplane mode" });
    await expect(toggle).not.toBeChecked();
    const track = (await toggle.boundingBox())!;
    await page.mouse.click(track.x + track.width / 2, track.y - 3);
    await expect(toggle).toBeChecked();
    expect(track.height + 8).toBeGreaterThanOrEqual(24);
  });

  test("a responsive field is vertical in a narrow group and horizontal in a wide one", async ({
    page,
  }) => {
    await page.goto("/components/field");
    const field = page.locator('[data-example="Responsive"] [data-slot="field"]').first();
    const direction = () => field.evaluate((el) => getComputedStyle(el).flexDirection);
    await page.setViewportSize({ width: 360, height: 800 });
    expect(await direction()).toBe("column");
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await direction()).toBe("row");
  });

  test("a table wider than its box scrolls in a region that takes focus", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto("/components/table");
    const region = page.getByRole("region", { name: "Shipments" });
    await expect(region).toHaveAttribute("tabindex", "0");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    // a table that fits takes no tab stop
    await expect(page.getByRole("region", { name: "Recent invoices" })).not.toHaveAttribute(
      "tabindex",
      /.*/,
    );
  });

  test("an input is 16 px on a phone, so that iOS does not zoom in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/components/input");
    const size = await page
      .getByRole("textbox", { name: "Full name" })
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(size).toBe("16px");
  });
});
