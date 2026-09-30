/**
 * Behaviour of the optional content props added to POC blocks. Their default
 * render is locked by the parity tests; these check what the new props do.
 */
import { describe, it, expect, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot, type Root } from "react-dom/client";
import { act, type ComponentType } from "react";
import { BookOpen, Plus } from "lucide-react";
import { NotFound } from "../src/states/not-found/react.js";
import { ErrorState, Error as ErrorAlias } from "../src/states/error/react.js";
import { Empty } from "../src/states/empty/react.js";
import { Maintenance } from "../src/states/maintenance/react.js";
import { ErrorSection, Error as ErrorSectionAlias } from "../src/sections/error/react.js";
import { Carousel } from "../src/images/carousel/react.js";
import { Gallery } from "../src/images/gallery/react.js";
import { Fingerprint } from "../src/security/fingerprint/react.js";
import { CommandPalette } from "../src/search/command-palette/react.js";
import { Results } from "../src/search/results/react.js";
import { Half } from "../src/keyboard/half/react.js";
import { Toast } from "../src/notifications/toast/react.js";
import { NotificationList } from "../src/notifications/list/react.js";
import { Pricing } from "../src/sections/pricing/react.js";
import { Stats } from "../src/sections/stats/react.js";
import { Faq } from "../src/sections/faq/react.js";
import { Team } from "../src/sections/team/react.js";
import { Testimonials } from "../src/sections/testimonials/react.js";
import { Logos } from "../src/sections/logos/react.js";
import { Process } from "../src/sections/process/react.js";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html").body;
const texts = (root: Element, selector: string) =>
  [...root.querySelectorAll(selector)].map((el) => el.textContent?.trim());

const states: [string, ComponentType<Record<string, unknown>>][] = [
  ["states/not-found", NotFound as never],
  ["states/error", ErrorState as never],
  ["states/empty", Empty as never],
  ["states/maintenance", Maintenance as never],
];

describe("states copy", () => {
  const copy = {
    title: "Page not found",
    description: "It moved or never existed.",
    actions: [{ label: "Go home", href: "/" }, { label: "Retry" }],
  };

  for (const [key, State] of states) {
    it(`${key}: renders nothing new without copy`, () => {
      const html = renderToStaticMarkup(<State />);
      expect(
        html.startsWith('<div aria-hidden="true" class="relative isolate flex size-full'),
      ).toBe(true);
      expect(html).not.toMatch(/<h2|<a |<p class="text-sm/);
    });

    it(`${key}: renders heading, text and actions outside the hidden illustration`, () => {
      const body = parse(renderToStaticMarkup(<State {...copy} />));
      const heading = body.querySelector("h2")!;
      expect(heading.textContent).toBe("Page not found");
      expect(heading.closest("[aria-hidden]")).toBeNull();
      expect(body.textContent).toContain("It moved or never existed.");
      const link = body.querySelector("a")!;
      expect(link.getAttribute("href")).toBe("/");
      expect(link.textContent).toBe("Go home");
      expect(link.className).toContain("bg-primary");
      const button = body.querySelector("button")!;
      expect(button.getAttribute("type")).toBe("button");
      expect(button.textContent).toBe("Retry");
      expect(body.querySelector("[aria-hidden='true']")).not.toBeNull();
    });
  }

  it("titleAs picks the heading element and className lands on the wrapper", () => {
    const body = parse(
      renderToStaticMarkup(<NotFound title="Lost" titleAs="h1" className="min-h-dvh" />),
    );
    expect(body.querySelector("h1")?.textContent).toBe("Lost");
    expect(body.firstElementChild!.className).toContain("min-h-dvh");
    expect(body.querySelector("[aria-hidden]")!.className).not.toContain("min-h-dvh");
  });

  it("keeps the deprecated Error aliases", () => {
    expect(ErrorAlias).toBe(ErrorState);
    expect(ErrorSectionAlias).toBe(ErrorSection);
  });
});

describe("fixed stages fit their container", () => {
  let root: Root | undefined;
  let host: HTMLDivElement | undefined;
  const RO = globalThis.ResizeObserver;
  afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    globalThis.ResizeObserver = RO;
  });

  it("scales the stage down to the frame width on the client", () => {
    const observers: (() => void)[] = [];
    globalThis.ResizeObserver = class {
      constructor(private cb: () => void) {
        observers.push(() => this.cb());
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as never;
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<NotFound />));
    const frame = host.firstElementChild as HTMLElement;
    const stage = frame.lastElementChild as HTMLElement;
    Object.defineProperty(frame, "clientWidth", { value: 208 });
    Object.defineProperty(frame, "clientHeight", { value: 400 });
    Object.defineProperty(stage, "offsetWidth", { value: 416 });
    Object.defineProperty(stage, "offsetHeight", { value: 200 });
    act(() => observers.forEach((notify) => notify()));
    expect(stage.style.scale).toBe("0.5");
  });

  it("leaves the server render unscaled", () => {
    expect(renderToStaticMarkup(<NotFound />)).not.toContain("scale:");
  });
});

describe("images/carousel", () => {
  const caption = (html: string) => texts(parse(html), "span.truncate")[0];

  it("centres the slide activeIndex points to", () => {
    expect(caption(renderToStaticMarkup(<Carousel activeIndex={0} />))).toBe("Costa Brava");
    expect(caption(renderToStaticMarkup(<Carousel />))).toBe("Dolomites");
    expect(caption(renderToStaticMarkup(<Carousel activeIndex={2} />))).toBe("Big Sur");
  });

  it("counts custom slides and survives empty data", () => {
    const slides = ["A", "B", "C", "D"].map((title) => ({
      kind: "ocean" as const,
      title,
      caption: "",
    }));
    const html = renderToStaticMarkup(<Carousel slides={slides} activeIndex={3} />);
    expect(caption(html)).toBe("D");
    expect(parse(html).textContent).toContain("4 / 4");
    expect(() => renderToStaticMarkup(<Carousel slides={[]} />)).not.toThrow();
  });

  it("uses alt text when given", () => {
    const html = renderToStaticMarkup(
      <Carousel slides={[{ src: "/a.jpg", title: "Beach", caption: "", alt: "Palm trees" }]} />,
    );
    expect(html).toContain('alt="Palm trees"');
  });
});

describe("images/gallery", () => {
  it("uses alt text when given", () => {
    const html = renderToStaticMarkup(
      <Gallery items={[{ src: "/a.jpg", title: "Creek", alt: "Stream in a forest" }]} />,
    );
    expect(html).toContain('alt="Stream in a forest"');
    expect(html).toContain('aria-label="Stream in a forest"');
  });
});

describe("security/fingerprint", () => {
  it("draws a quarter arc when scanning statically", () => {
    const html = renderToStaticMarkup(<Fingerprint state="scanning" />);
    expect(html).toContain('stroke-dasharray="0.25 1"');
    expect(html).not.toContain("path-length");
    expect(renderToStaticMarkup(<Fingerprint />)).not.toContain("stroke-dasharray");
  });
});

describe("search icons and empty data", () => {
  it("command-palette accepts icon components and elements", () => {
    const html = renderToStaticMarkup(
      <CommandPalette
        groups={[
          {
            label: "Actions",
            items: [
              { icon: Plus, label: "A" },
              { icon: <BookOpen className="size-3" />, label: "B" },
            ],
          },
        ]}
      />,
    );
    expect(html).toContain("lucide-plus");
    expect(html).toContain("lucide-book-open");
  });

  it("command-palette shows its empty text and label overrides", () => {
    const html = renderToStaticMarkup(
      <CommandPalette groups={[]} labels={{ empty: "Aucun résultat", navigate: "Naviguer" }} />,
    );
    expect(html).toContain("Aucun résultat");
    expect(html).toContain("Naviguer");
    expect(html).not.toContain("New project");
  });

  it("results accepts icon components and shows an empty state", () => {
    const html = renderToStaticMarkup(
      <Results results={[{ icon: BookOpen, title: "Docs", path: "a", snippet: "b" }]} />,
    );
    expect(html).toContain("lucide-book-open");
    const empty = renderToStaticMarkup(<Results results={[]} labels={{ empty: "Rien" }} />);
    expect(empty).toContain("Rien");
    expect(empty).not.toContain("Webhooks overview");
  });
});

describe("keyboard/half", () => {
  it("lays out an AZERTY half", () => {
    const keys = texts(parse(renderToStaticMarkup(<Half keymap="azerty" />)), "button span");
    expect(keys).toEqual(expect.arrayContaining(["A", "Z", "Q", "W", "<"]));
    expect(keys).not.toContain("Y");
  });

  it("overrides captions without breaking key matching", () => {
    const html = renderToStaticMarkup(<Half keys={["Shift", "A"]} labels={{ shift: "maj" }} />);
    const body = parse(html);
    expect(texts(body, "button span")).toContain("maj");
    expect(body.querySelectorAll(".ring-primary\\/40").length).toBe(2);
  });
});

describe("notifications", () => {
  it("toast has an error variant and falls back on unknown ones", () => {
    expect(renderToStaticMarkup(<Toast variant="error" />)).toContain("text-destructive");
    expect(() => renderToStaticMarkup(<Toast variant={"nope" as never} />)).not.toThrow();
  });

  it("list overrides its labels and survives an unknown icon", () => {
    const html = renderToStaticMarkup(
      <NotificationList
        items={[{ icon: "nope" as never, title: "Hi", detail: "x", time: "1m" }]}
        labels={{ title: "Alertes", markAllRead: "Tout lire" }}
      />,
    );
    expect(html).toContain("Alertes");
    expect(html).toContain("Tout lire");
  });
});

describe("section data props", () => {
  it("pricing draws plan names, prices and buttons", () => {
    const body = parse(
      renderToStaticMarkup(
        <Pricing plans={[{ name: "Pro", price: "29 €", featured: true, cta: "Try" }]} />,
      ),
    );
    expect(body.textContent).toContain("Pro");
    expect(body.textContent).toContain("29 €");
    expect(body.textContent).toContain("Try");
    expect(body.textContent).not.toContain("$19/m");
  });

  it("stats draws its values and captions", () => {
    const body = parse(
      renderToStaticMarkup(<Stats values={["1k", { value: "40", label: "Countries" }]} />),
    );
    expect(body.textContent).toContain("1k");
    expect(body.textContent).toContain("Countries");
    expect(body.textContent).not.toContain("5m");
  });

  it("faq, logos, process and team take text or a count", () => {
    expect(renderToStaticMarkup(<Faq items={[{ question: "Why?" }]} />)).toContain("Why?");
    expect(renderToStaticMarkup(<Logos logos={["Acme"]} />)).toContain("Acme");
    expect(
      parse(renderToStaticMarkup(<Logos logos={2} />)).querySelectorAll(".h-2\\.5").length,
    ).toBe(2);
    expect(renderToStaticMarkup(<Process steps={["Sign up", "Ship"]} />)).toContain("Sign up");
    const team = renderToStaticMarkup(<Team members={[{ name: "Ada Lovelace", role: "CEO" }]} />);
    expect(team).toContain("AL");
    expect(team).toContain("CEO");
  });

  it("testimonials draws the author and localised quotes", () => {
    const html = renderToStaticMarkup(
      <Testimonials quote="Super" author="Jeanne" quotes={["« ", " »"]} />,
    );
    expect(parse(html).textContent).toContain("« Super »");
    expect(html).toContain("Jeanne");
  });
});
