/**
 * The prompt box's toolbar, caret, meter and send button follow the typed words
 * (~1.3 s for the default prompt) — not the word count read as seconds (14 s).
 */
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Props = Record<string, unknown>;
const seen = vi.hoisted(() => [] as Props[]);

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const motionProps = new Set(["variants", "initial", "animate", "exit", "transition", "custom"]);
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => (props: Props) => {
        seen.push(props);
        const rest = Object.fromEntries(Object.entries(props).filter(([k]) => !motionProps.has(k)));
        return createElement(tag, rest);
      },
    },
  );
  return { ...actual, motion };
});

const { PromptBox, promptBoxDefaultCopy } = await import("../src/ai/prompt-box/react.js");

/** Entrance delay (s) of an element: its `visible` variant, resolved with its `custom`. */
function visibleDelay(props: Props): number {
  const variants = props.variants as Record<string, unknown> | undefined;
  const visible = variants?.visible;
  const target = (typeof visible === "function" ? visible(props.custom) : visible) as
    { transition?: { delay?: number } } | undefined;
  return target?.transition?.delay ?? 0;
}

function rendered(prompt: string) {
  seen.length = 0;
  renderToStaticMarkup(<PromptBox animated trigger="mount" prompt={prompt} />);
  const toolbar = seen.find((p) => String(p.className).includes("border-t px-3 py-2.5"))!;
  return { toolbar: visibleDelay(toolbar), max: Math.max(...seen.map(visibleDelay)) };
}

describe("prompt-box timing", () => {
  it("shows the toolbar right after the last word", () => {
    const words = promptBoxDefaultCopy.prompt.split(/\s+/).length;
    const lastWordEnd = 0.4 + (words - 1) * 0.05 + 0.22;
    const { toolbar, max } = rendered(promptBoxDefaultCopy.prompt);
    expect(toolbar).toBeCloseTo(lastWordEnd + 0.15, 5);
    expect(max).toBeLessThan(2);
  });

  it("scales with the prompt length, not with seconds per word", () => {
    expect(rendered("Hi").toolbar).toBeCloseTo(0.4 + 0.22 + 0.15, 5);
    expect(rendered(Array.from({ length: 40 }, () => "word").join(" ")).max).toBeLessThan(3.5);
  });
});
