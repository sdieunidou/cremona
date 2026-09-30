import { Suspense, lazy, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@cremona/core";
import { useRoute, parseRoute } from "./lib/router.js";
import { useTheme } from "./lib/theme.js";
import { findItem, stats } from "./lib/discovery.js";
import { useFocusTrap } from "./lib/focus.js";
import { useMediaQuery } from "./lib/viewport.js";
import { SHELL } from "./lib/shell-classes.js";
import { SidebarContent, type NavProps } from "./components/sidebar.js";
import { Header } from "./components/header.js";
import { SearchDialog } from "./components/search-dialog.js";
import { ErrorBoundary } from "./components/error-boundary.js";
import { Link } from "./components/link.js";
import { HomePage } from "./pages/home.js";
import { NotFound } from "./pages/not-found.js";

const BlockPage = lazy(() => import("./pages/block.js"));

const MOBILE = "(max-width: 767px)";

export function App() {
  const [path, navigate] = useRoute();
  const route = parseRoute(path);
  const found = route.name === "block" ? findItem(route.category, route.file) : undefined;
  const { appearance, theme, isDark, updateAppearance, updateTheme, toggleDark } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const mobile = useMediaQuery(MOBILE);
  if (navOpen && !mobile) setNavOpen(false);
  const navId = useId();
  const navRef = useRef<HTMLDivElement>(null);
  const insetRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useFocusTrap(navRef, navOpen, {
    onEscape: () => setNavOpen(false),
    initialFocus: () => navRef.current?.querySelector<HTMLElement>("nav ul a"),
    inertOutside: () => [insetRef.current],
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNavOpen(false);
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const title =
    route.name === "home"
      ? "Cremona — animated visual blocks"
      : found
        ? `${found.item.name} — ${found.group.category} — Cremona`
        : "Not found — Cremona";
  useEffect(() => {
    document.title = title;
  }, [title]);

  const nav: NavProps = {
    path,
    onNavigate: (to) => {
      navigate(to);
      setNavOpen(false);
    },
    onOpenSearch: () => {
      setNavOpen(false);
      setSearchOpen(true);
    },
  };

  return (
    <div
      className={SHELL.wrapper}
      style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:outline-none focus:ring-3 focus:ring-ring/50"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div
        className={cn(
          SHELL.sidebar,
          navOpen &&
            "max-md:block max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-100 max-md:w-64 max-md:bg-sidebar max-md:shadow-xl",
        )}
        data-state="expanded"
        data-collapsible=""
        data-variant="inset"
        data-side="left"
        data-slot="sidebar"
      >
        <div className={SHELL.gap} />
        <div
          ref={navRef}
          id={navId}
          className={cn(SHELL.container, navOpen && "max-md:flex")}
          data-slot="sidebar-container"
          data-side="left"
        >
          <nav aria-label="Visuals" className={SHELL.inner} data-sidebar="sidebar">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring md:hidden"
              onClick={() => setNavOpen(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <SidebarContent {...nav} />
            <div className={SHELL.footer}>
              <p className="px-2 text-xs text-muted-foreground">
                {stats.blocks} blocks · {stats.variants.toLocaleString("en-US")} variants ·{" "}
                {stats.categories} categories
              </p>
            </div>
          </nav>
        </div>
      </div>
      {navOpen && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-90 bg-black/40 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}
      <div ref={insetRef} className={SHELL.main} data-slot="sidebar-inset">
        <Header
          appearance={appearance}
          theme={theme}
          isDark={isDark}
          navOpen={navOpen}
          navId={navId}
          onAppearance={updateAppearance}
          onTheme={updateTheme}
          onToggleDark={toggleDark}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleNav={() => setNavOpen((v) => !v)}
          onNavigate={nav.onNavigate}
        />
        <main id="main" ref={mainRef} tabIndex={-1} className="flex flex-1 flex-col outline-none">
          <ErrorBoundary
            key={path}
            fallback={(error) => <PageError error={error} onNavigate={nav.onNavigate} />}
          >
            {route.name === "home" ? (
              <HomePage onNavigate={nav.onNavigate} />
            ) : found ? (
              <Suspense fallback={<PageLoading />}>
                <BlockPage blockKey={`${found.group.slug}/${found.item.file}`} />
              </Suspense>
            ) : (
              <NotFound path={path} onNavigate={nav.onNavigate} />
            )}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={nav.onNavigate}
      />
    </div>
  );
}

function PageLoading() {
  return (
    <section className="relative py-8 md:py-16" aria-busy="true">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16">
        <p role="status" className="text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    </section>
  );
}

function PageError({ error, onNavigate }: { error: Error; onNavigate: (to: string) => void }) {
  return (
    <section role="alert" className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">This page failed to render</h1>
        <p className="font-mono text-sm break-words text-muted-foreground">{error.message}</p>
        <Link to="/" onNavigate={onNavigate} className="text-sm underline underline-offset-4">
          Back to all visuals
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col items-center gap-4 text-center md:flex-row-reverse md:justify-between md:text-left">
        <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-muted-foreground">
          <span>Crafted with</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            className="inline-block size-4 text-rose-600 dark:text-rose-400"
          >
            <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.006.004h-.002l-.001-.001Z" />
          </svg>
          <span>for interfaces that feel alive.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Cremona — animated visual blocks design system. React &amp; Stimulus, MCP-ready.
        </p>
      </div>
    </footer>
  );
}
