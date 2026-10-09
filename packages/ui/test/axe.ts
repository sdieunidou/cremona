import axe from "axe-core";

/**
 * The accessibility violations axe-core finds in `context`, as readable lines. jsdom has no layout and
 * no colours: contrast is the job of the token tests (packages/tokens), and the page-level `region`
 * rule does not apply to a component.
 */
export async function a11yViolations(context: Element = document.body): Promise<string[]> {
  const { violations } = await axe.run(context, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.map((n) => n.html).join(" | ")}`);
}
