import { Fragment, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface BreadcrumbItem {
  label: string;
  /** Link target; the last item is the current page. */
  href?: string;
}

export interface BreadcrumbProps extends VisualProps {
  separator?: "chevron" | "slash";
  /** Collapse the middle of the trail into "…" (before the last two items). */
  ellipsis?: boolean;
  /** The trail, as labels or `{ label, href }` (default: a four-level demo path). */
  items?: (string | BreadcrumbItem)[];
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const demoItems = ["Home", "Projects", "Design system", "Tokens"];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Breadcrumb({
  separator = "chevron",
  ellipsis = false,
  items = demoItems,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: BreadcrumbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const crumbs: (BreadcrumbItem | null)[] = items.map((item) =>
    typeof item === "string" ? { label: item } : item,
  );
  if (ellipsis && crumbs.length > 2) crumbs.splice(crumbs.length - 2, 0, null);
  const last = crumbs.length - 1;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.nav
        aria-label="Breadcrumb"
        className={cn("text-sm", fill && "w-full self-start")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((crumb, i) => (
            <Fragment key={`${crumb?.label ?? "…"}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className="flex items-center text-muted-foreground/60">
                  {separator === "slash" ? (
                    <span className="text-xs">/</span>
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </li>
              )}
              <li>
                {crumb === null ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border px-1 text-[11px] font-medium text-muted-foreground">
                    <span aria-hidden="true">…</span>
                    <span className="sr-only">More pages</span>
                  </span>
                ) : i === last ? (
                  <span
                    aria-current="page"
                    className="font-medium whitespace-nowrap text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <a
                    href={crumb.href}
                    className={cn(
                      "rounded-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                      focusRing,
                    )}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="whitespace-nowrap text-muted-foreground">{crumb.label}</span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </motion.nav>
    </div>
  );
}
