import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Toaster, toast, useToast } from "../src/toast.js";
import { a11yViolations } from "./axe.js";

// the toasts live in a module: close them all and let them go between tests
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  act(() => toast.dismiss());
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  vi.useRealTimers();
});

const titles = () =>
  [...document.querySelectorAll('[data-slot="toast-title"]')].map((el) => el.textContent);

const setup = () => userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

describe("toast", () => {
  it("shows a toast with a title and a description", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", description: "Your draft is up to date." });
    });
    const root = document.querySelector('[data-slot="toast"]');
    expect(root).toHaveTextContent("Saved");
    expect(root).toHaveTextContent("Your draft is up to date.");
    expect(root).toHaveAttribute("data-variant", "default");
  });

  it("puts its toasts in a named region that F8 reaches", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved" });
    });
    expect(screen.getByRole("region", { name: "Notifications (F8)" })).toBeInTheDocument();
  });

  it("names its region in your language", () => {
    render(<Toaster label="Notifications ({hotkey})" />);
    act(() => {
      toast({ title: "Enregistré" });
    });
    expect(screen.getByRole("region", { name: /Notifications/ })).toBeInTheDocument();
  });

  it("does nothing without a Toaster", () => {
    render(<div>page</div>);
    act(() => {
      toast({ title: "Nobody listens" });
    });
    expect(screen.queryByText("Nobody listens")).not.toBeInTheDocument();
  });

  it("closes from its close button, named in your language", async () => {
    const user = setup();
    render(<Toaster closeLabel="Fermer" />);
    act(() => {
      toast({ title: "Saved" });
    });
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(titles()).toEqual([]);
  });

  it("closes on its own after its duration", () => {
    render(<Toaster duration={2000} />);
    act(() => {
      toast({ title: "Saved" });
    });
    expect(titles()).toEqual(["Saved"]);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(titles()).toEqual([]);
  });

  it("does not close an error by itself, nor a toast with an action", () => {
    render(<Toaster duration={1000} />);
    act(() => {
      toast({ title: "Payment failed", variant: "destructive" });
      toast({ title: "Message deleted", action: { label: "Undo", onClick: () => {} } });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(titles().sort()).toEqual(["Message deleted", "Payment failed"]);
  });

  it("closes sooner or later as its own duration says", () => {
    render(<Toaster duration={10_000} />);
    act(() => {
      toast({ title: "Quick", duration: 500 });
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(titles()).toEqual([]);
  });

  it("runs its action, then closes", async () => {
    const user = setup();
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ title: "Message deleted", action: { label: "Undo", onClick } });
    });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(titles()).toEqual([]);
  });

  it("announces an error at once and the rest politely", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", variant: "success" });
      toast({ title: "Payment failed", variant: "destructive" });
    });
    // a screen reader hears them from live regions that fill a frame later
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const live = (mode: string) =>
      document.querySelector(`[role="status"][aria-live="${mode}"]`)?.textContent ?? "";
    expect(live("assertive")).toContain("Payment failed");
    expect(live("assertive")).not.toContain("Saved");
    expect(live("polite")).toContain("Saved");
  });

  it("marks a status with an icon and an edge of its token, hidden from assistive technology", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", variant: "success" });
    });
    const root = document.querySelector('[data-slot="toast"]') as HTMLElement;
    expect(root).toHaveClass("border-l-success");
    expect(root.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("closes or changes a toast from what toast() returns", () => {
    render(<Toaster />);
    let handle!: ReturnType<typeof toast>;
    act(() => {
      handle = toast({ title: "Uploading…" });
    });
    act(() => handle.update({ title: "Uploaded" }));
    expect(titles()).toEqual(["Uploaded"]);
    act(() => handle.dismiss());
    expect(titles()).toEqual([]);
  });

  it("shows three at a time, the newest first", () => {
    render(<Toaster />);
    act(() => {
      for (const n of [1, 2, 3, 4, 5]) toast({ title: `Message ${n}` });
    });
    expect(titles()).toEqual(["Message 5", "Message 4", "Message 3"]);
  });

  it("is readable by components through useToast", () => {
    function Count() {
      const { toasts } = useToast();
      return <p>{toasts.filter((t) => t.open).length} open</p>;
    }
    render(
      <div>
        <Count />
        <Toaster />
      </div>,
    );
    expect(screen.getByText("0 open")).toBeInTheDocument();
    act(() => {
      toast({ title: "One" });
    });
    expect(screen.getByText("1 open")).toBeInTheDocument();
  });

  it("only animates when the user does not ask for reduced motion", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved" });
    });
    const root = document.querySelector('[data-slot="toast"]') as HTMLElement;
    const animated = root.className.split(/\s+/).filter((c) => /animate-|fade-|slide-/.test(c));
    expect(animated.length).toBeGreaterThan(0);
    expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("has no accessibility violation", async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", description: "All good.", variant: "success" });
      toast({
        title: "Failed",
        variant: "destructive",
        action: { label: "Retry", onClick: () => {} },
      });
    });
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
