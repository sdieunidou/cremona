import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Search, Sun, Moon, Monitor, Palette, Check } from "lucide-react";
import { cn } from "@cremona/core";
import { SHELL } from "../lib/shell-classes.js";
import { SEARCH_SHORTCUT } from "../lib/platform.js";
import { APPEARANCES, THEMES, type Appearance } from "../lib/theme.js";
import { CremonaMark } from "./sidebar.js";
import { Link } from "./link.js";

export interface HeaderProps {
  appearance: Appearance;
  theme: string;
  isDark: boolean;
  navOpen: boolean;
  navId: string;
  onAppearance: (value: Appearance) => void;
  onTheme: (value: string) => void;
  onToggleDark: () => void;
  onOpenSearch: () => void;
  onToggleNav: () => void;
  onNavigate: (to: string) => void;
}

const BUTTON =
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-transform outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export function Header({
  appearance,
  theme,
  isDark,
  navOpen,
  navId,
  onAppearance,
  onTheme,
  onToggleDark,
  onOpenSearch,
  onToggleNav,
  onNavigate,
}: HeaderProps) {
  return (
    <header className={SHELL.pageHeader}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex h-14 items-center gap-2 bg-background/80 backdrop-blur md:gap-2 md:rounded-t-xl">
        <div className="mr-auto flex items-center gap-1 md:gap-2">
          <button
            type="button"
            className={cn(BUTTON, "size-9 md:hidden")}
            onClick={onToggleNav}
            aria-label="Navigation menu"
            aria-expanded={navOpen}
            aria-controls={navId}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-panel-left lucide-sidebar"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(
              BUTTON,
              "h-9 px-2.5 gap-2 text-muted-foreground md:w-55 md:justify-start",
            )}
            onClick={onOpenSearch}
            aria-label="Search visuals"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search data-icon="inline-start" aria-hidden="true" />
            <span className="hidden flex-1 text-left font-normal md:inline">Search visuals...</span>
            <kbd className="pointer-events-none hidden items-center gap-1 rounded border bg-background/75 px-1 py-0.25 font-sans text-[10px] font-semibold uppercase md:inline-flex">
              {SEARCH_SHORTCUT}
            </kbd>
          </button>
          <Link
            to="/"
            onNavigate={onNavigate}
            className="group flex md:hidden"
            aria-label="Cremona home"
          >
            <span className="inline-flex items-center gap-2 transition-opacity group-hover:opacity-80 ml-[36px]">
              <CremonaMark />
            </span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <ThemeMenu
            appearance={appearance}
            theme={theme}
            onAppearance={onAppearance}
            onTheme={onTheme}
          />
          <button
            type="button"
            className={cn(BUTTON, "size-9")}
            onClick={onToggleDark}
            aria-label="Dark mode"
            aria-pressed={isDark}
          >
            <Sun
              aria-hidden="true"
              className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
            />
            <Moon
              aria-hidden="true"
              className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

const APPEARANCE_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * Menu button with two radio groups (appearance, theme): arrow keys, Home/End and
 * type-ahead move between items, Enter/Space picks, Escape and Tab close.
 */
function ThemeMenu({
  appearance,
  theme,
  onAppearance,
  onTheme,
}: {
  appearance: Appearance;
  theme: string;
  onAppearance: (value: Appearance) => void;
  onTheme: (value: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<"first" | "last">("first");

  const items = () => [
    ...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []),
  ];

  useEffect(() => {
    if (!open) return;
    const list = [
      ...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []),
    ];
    (focusOnOpen.current === "last" ? list[list.length - 1] : list[0])?.focus();
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    focusOnOpen.current = e.key === "ArrowUp" ? "last" : "first";
    setOpen(true);
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (index: number) => {
      e.preventDefault();
      list[(index + list.length) % list.length]?.focus();
    };
    if (e.key === "ArrowDown") focusAt(i + 1);
    else if (e.key === "ArrowUp") focusAt(i - 1);
    else if (e.key === "Home") focusAt(0);
    else if (e.key === "End") focusAt(list.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // focus goes back to the trigger, then the Tab moves on from there
      triggerRef.current?.focus();
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const key = e.key.toLowerCase();
      const next = [...list.slice(i + 1), ...list.slice(0, i + 1)].find((el) =>
        el.textContent?.trim().toLowerCase().startsWith(key),
      );
      if (next) {
        e.preventDefault();
        next.focus();
      }
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(BUTTON, "size-9")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-label="Theme and appearance"
        onClick={() => {
          focusOnOpen.current = "first";
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <Palette aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={`${id}-menu`}
          role="menu"
          tabIndex={-1}
          aria-label="Theme and appearance"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-10 z-50 max-h-[calc(100svh-4.5rem)] w-56 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none"
        >
          <MenuGroup id={`${id}-appearance`} label="Appearance">
            {APPEARANCES.map((a) => {
              const Icon = APPEARANCE_ICONS[a.value];
              return (
                <MenuRadio
                  key={a.value}
                  checked={appearance === a.value}
                  onSelect={() => {
                    onAppearance(a.value);
                    close();
                  }}
                >
                  <Icon className="size-4 opacity-70" aria-hidden="true" />
                  <span className="flex-1 text-left">{a.label}</span>
                </MenuRadio>
              );
            })}
          </MenuGroup>
          <div role="separator" className="-mx-1 my-1 h-px bg-border" />
          <MenuGroup id={`${id}-theme`} label="Theme">
            {THEMES.map((t) => (
              <MenuRadio
                key={t.value}
                checked={theme === t.value}
                onSelect={() => {
                  onTheme(t.value);
                  close();
                }}
              >
                <span className="flex gap-0.5" aria-hidden="true">
                  {t.swatches.map((s, i) => (
                    <span
                      key={i}
                      className="size-2.5 rounded-full border border-border/50"
                      style={{ background: s }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-left">{t.label}</span>
              </MenuRadio>
            ))}
          </MenuGroup>
        </div>
      )}
    </div>
  );
}

function MenuGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id}>
      <div id={id} role="none" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function MenuRadio({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onSelect}
      onMouseMove={(e) => {
        if (document.activeElement !== e.currentTarget) e.currentTarget.focus();
      }}
    >
      {children}
      <Check className={cn("size-4 opacity-70", !checked && "invisible")} aria-hidden="true" />
    </button>
  );
}
