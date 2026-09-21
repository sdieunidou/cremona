import { useEffect, useMemo, useState } from "react";
import { Search, Shapes, Folder, FolderOpen, ChevronRight } from "lucide-react";
import { SHELL } from "../lib/shell-classes.js";
import { categories, findBlock, type CatalogItem } from "../lib/discovery.js";
import { cn } from "@cremona/core";

export interface NavProps {
  path: string;
  onNavigate: (to: string) => void;
  onOpenSearch: () => void;
}

export function SidebarContent({ path, onNavigate, onOpenSearch }: NavProps) {
  const current = /^\/visuals\/([\w-]+)\/([\w-]+)/.exec(path);
  return (
    <>
      <div className={SHELL.header}>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <a
            className="group flex"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("/");
            }}
          >
            <span className="inline-flex items-center gap-2 transition-opacity group-hover:opacity-80">
              <CremonaMark />
              <span className="font-semibold tracking-tight text-lg text-foreground hidden md:block">
                Cremona
                <span className="bg-[linear-gradient(90deg,var(--color-violet-600),var(--color-sky-600),var(--color-fuchsia-600),var(--color-indigo-600),var(--color-purple-600),var(--color-blue-600),var(--color-violet-600))] dark:bg-[linear-gradient(90deg,var(--color-violet-400),var(--color-sky-400),var(--color-fuchsia-400),var(--color-indigo-400),var(--color-purple-400),var(--color-blue-400),var(--color-violet-400))] bg-size-[300%_100%] bg-clip-text text-transparent">
                  UI
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>
      <div className={SHELL.content}>
        <div className={SHELL.group}>
          <div className="text-xs font-medium tracking-wider text-sidebar-foreground/70 uppercase px-2 pb-1">
            Explore the library
          </div>
          <ul className={SHELL.menu}>
            <li className={SHELL.menuItem}>
              <a
                data-active={!current || undefined}
                className={SHELL.menuButton}
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("/");
                }}
              >
                <Shapes className="opacity-50" />
                <span>All visuals</span>
              </a>
            </li>
            <li className={SHELL.menuItem}>
                <button
                  type="button"
                  className={cn(SHELL.menuButton, "text-muted-foreground")}
                  onClick={onOpenSearch}
                >
                <Search className="opacity-50" />
                <span>Search…</span>
                <span className="pointer-events-none ml-auto hidden items-center gap-1 rounded border bg-background/75 px-1 py-0.25 text-[10px] font-semibold uppercase md:inline-flex">
                  Ctrl K
                </span>
              </button>
            </li>
          </ul>
          <div className={cn(SHELL.separator, "mx-0 my-2")} />
          <ul className={cn(SHELL.menu, "gap-0.5")}>
            {categories.map((cat) => (
              <CategoryGroup
                key={cat.slug}
                slug={cat.slug}
                label={cat.category}
                items={cat.items}
                activeKey={current ? `${current[1]}/${current[2]}` : null}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function CategoryGroup({
  slug,
  label,
  items,
  activeKey,
  onNavigate,
}: {
  slug: string;
  label: string;
  items: CatalogItem[];
  activeKey: string | null;
  onNavigate: (to: string) => void;
}) {
  const containsActive = activeKey?.startsWith(`${slug}/`) ?? false;
  const [open, setOpen] = useState(containsActive);
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <div data-open={open || undefined} data-closed={!open || undefined} className="group/collapsible">
      <li className={SHELL.menuItem}>
        <button
          type="button"
          aria-expanded={open}
          className={SHELL.collapsibleTrigger}
          onClick={() => setOpen((v) => !v)}
        >
          <Folder className="opacity-50 group-data-open/collapsible:hidden" />
          <FolderOpen className="hidden opacity-50 group-data-open/collapsible:block" />
          <span>{label}</span>
          <ChevronRight className="ml-auto opacity-50 transition-transform group-data-open/collapsible:rotate-90" />
        </button>
      </li>
      {open && (
        <ul className={cn(SHELL.menu, "gallery-submenu")}>
          {items.map((item) => {
            const href = `/visuals/${slug}/${item.file}`;
            const active = activeKey === `${slug}/${item.file}`;
            const ported = !!findBlock(slug, item.file);
            return (
              <li key={item.file} className={SHELL.menuItem}>
                <a
                  data-active={active || undefined}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(href);
                  }}
                  className={cn(SHELL.menuButton, !ported && "opacity-50")}
                  title={item.description}
                >
                  <span className="truncate">{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** The isometric cube mark (favicon.svg inline, POC-faithful). */
export function CremonaMark({ className = "text-foreground will-change-transform size-6 shrink-0" }: { className?: string }) {
  const id = useMemo(() => `mark-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="1" y1="1" x2="47" y2="47">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeOpacity="0.25">
        <path d="M24 1 L24 24" />
        <path d="M24 24 L1 35.5" />
        <path d="M24 24 L47 35.5" />
      </g>
      <path d="M24 1 L47 12.5 L24 24 L1 12.5 Z" fill={`url(#${id})`} fillOpacity="0.75" stroke="none" />
      <path d="M24 24 L47 12.5 L47 35.5 L24 47 Z" fill={`url(#${id})`} fillOpacity="0.45" stroke="none" />
      <g stroke={`url(#${id})`} strokeOpacity="1">
        <path d="M24 1 L47 12.5 L24 24 L1 12.5 Z" />
        <path d="M1 12.5 L1 35.5" />
        <path d="M47 12.5 L47 35.5" />
        <path d="M24 24 L24 47" />
        <path d="M1 35.5 L24 47 L47 35.5" />
      </g>
    </svg>
  );
}
