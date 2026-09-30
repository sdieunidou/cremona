import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Bell, Cloud, Globe, Laptop, Workflow } from "lucide-react";
import { Converge } from "../src/connections/converge/react.js";
import { Flow } from "../src/connections/flow/react.js";
import { Pipeline } from "../src/connections/pipeline/react.js";
import { Sync } from "../src/connections/sync/react.js";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const count = (markup: string, needle: string) => markup.split(needle).length - 1;

describe("connections nodes", () => {
  it("draws an icon component exactly like the element it stands for", () => {
    expect(html(<Converge nodes={[Globe, Bell]} />)).toBe(
      html(
        <Converge
          nodes={[
            <Globe className="size-4" strokeWidth={2} />,
            <Bell className="size-4" strokeWidth={2} />,
          ]}
        />,
      ),
    );
    expect(html(<Flow transforms={[Workflow]} />)).toBe(
      html(<Flow transforms={[<Workflow className="size-4.5" strokeWidth={1.5} />]} />),
    );
    expect(html(<Pipeline logo={Workflow} inputs={[Globe]} />)).toBe(
      html(
        <Pipeline
          logo={<Workflow className="size-5" strokeWidth={1.5} />}
          inputs={[<Globe className="size-4" strokeWidth={2} />]}
        />,
      ),
    );
    expect(html(<Sync pairs={[[Laptop, Cloud]]} />)).toBe(
      html(
        <Sync
          pairs={[
            [
              <Laptop className="size-4" strokeWidth={2} />,
              <Cloud className="size-4" strokeWidth={2} />,
            ],
          ]}
        />,
      ),
    );
  });

  it("draws an empty list as a dashed slot, not the demo icons, and sends no pulse to it", () => {
    for (const markup of [
      html(<Converge animated nodes={[]} />),
      html(<Pipeline animated inputs={[]} outputs={[]} />),
      html(<Sync animated pairs={[]} />),
      html(<Flow animated sources={[]} transforms={[]} destinations={[]} />),
    ]) {
      expect(markup).toContain("border-dashed");
      expect(markup).not.toMatch(/lucide-(file-text|image|database|rss|globe|chart-column|mail)/);
      expect(markup).not.toContain("animateMotion");
    }
  });

  it("fills a partial flow with empty slots and pulses only between real nodes", () => {
    const markup = html(<Flow animated sources={[Globe]} />);
    expect(count(markup, "border-dashed")).toBe(2);
    expect(markup).not.toContain("lucide-rss");
    // source 0 → transform 0 plus the 4 transform → destination edges, two dots each
    expect(count(markup, "<animateMotion")).toBe(5 * 2);
  });

  it("keeps the stage aspect when it fills a panel", () => {
    for (const markup of [
      html(<Converge fill />),
      html(<Flow fill />),
      html(<Pipeline fill />),
      html(<Sync fill />),
    ]) {
      expect(markup).toMatch(/class="relative aspect-[\d/]+ w-(72|80) max-w-full self-center"/);
    }
  });
});
