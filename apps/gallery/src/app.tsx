import { useEffect, useState } from "react";
import { useRoute, parseRoute } from "./lib/router.js";
import { useTheme } from "./lib/theme.js";
import { SidebarContent, type NavProps } from "./components/sidebar.js";
import { Header, SearchDialog } from "./components/header.js";
import { HomePage, BlockPage } from "./pages/home.js";
import { SHELL } from "./lib/shell-classes.js";
import { cn } from "@cremona/core";

export function App() {
  const [path, navigate] = useRoute();
  const route = parseRoute(path);
  const { appearance, theme, isDark, updateTheme, toggleDark } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const route = parseRoute(path);
    document.title =
      route.name === "block"
        ? `${route.file} visual — Cremona`
        : "Cremona — animated visual blocks";
  }, [path]);

  const nav: NavProps = {
    path,
    onNavigate: (to) => {
      navigate(to);
      setMobileNav(false);
    },
    onOpenSearch: () => setSearchOpen(true),
  };

  const sidebarClass = cn(
    SHELL.sidebar,
    mobileNav && "!flex fixed inset-y-0 left-0 z-100 bg-sidebar shadow-xl",
  );

  return (
    <div className={SHELL.wrapper}>
      <div className={sidebarClass} data-state="expanded" data-collapsible="" data-variant="inset" data-side="left" data-slot="sidebar">
        <div className={SHELL.gap} />
        <div className={cn(SHELL.container, "!flex")} data-side="left">
          <div className={SHELL.inner} data-sidebar="sidebar">
            <SidebarContent {...nav} />
            <div className={SHELL.footer}>
              <p className="px-2 text-xs text-muted-foreground">
                {route.name === "home" ? "Every render is golden-verified." : "Render verified against the POC goldens."}
              </p>
            </div>
          </div>
        </div>
      </div>
      {mobileNav && (
        <div className="fixed inset-0 z-90 bg-black/40 md:hidden" onClick={() => setMobileNav(false)} />
      )}
      <main className={SHELL.main} data-slot="sidebar-inset">
        <Header
          appearance={appearance}
          theme={theme}
          onToggleDark={toggleDark}
          onTheme={updateTheme}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleSidebar={() => setMobileNav((v) => !v)}
        />
        {route.name === "home" ? (
          <HomePage onNavigate={nav.onNavigate} />
        ) : (
          <BlockPage category={route.category} file={route.file} onNavigate={nav.onNavigate} />
        )}
        <Footer />
      </main>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={nav.onNavigate} />
      <span className="hidden">{String(isDark)}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col items-center gap-4 text-center md:flex-row-reverse md:justify-between md:text-left">
        <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-muted-foreground">
          <span>Crafted with</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="inline-block size-4 text-rose-600 dark:text-rose-400">
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
