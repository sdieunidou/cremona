"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface PaginationLabels {
  /** Accessible name of the navigation landmark. */
  navigation: string;
  /** Accessible names of the arrow buttons. */
  previous: string;
  next: string;
  /** Status of the compact layout; `{page}` (emphasized) and `{total}` are replaced. */
  page: string;
}

export const paginationDefaultLabels: PaginationLabels = {
  navigation: "Pagination",
  previous: "Previous page",
  next: "Next page",
  page: "Page {page} of {total}",
};

/** Replaces each `{key}` of a label with its value. */
function interpolate(label: string, values: Record<string, string>): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key]! : match,
  );
}

export interface PaginationProps extends VisualProps {
  page?: number;
  total?: number;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<PaginationLabels>;
  compact?: boolean;
  rounded?: boolean;
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

function pageWindow(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (page >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", total];
}

export function Pagination({
  page = 2,
  total = 9,
  labels,
  compact = false,
  rounded = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: PaginationProps) {
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

  const text = { ...paginationDefaultLabels, ...labels };
  const [beforePage = "", afterPage = ""] = text.page.split("{page}");
  const shape = rounded ? "rounded-full" : "rounded-md";
  const arrowClasses = cn(
    "inline-flex size-8 items-center justify-center border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    shape,
  );
  const pageClasses = (current: boolean) =>
    cn(
      "inline-flex size-8 items-center justify-center border text-sm font-medium shadow-xs transition-colors",
      focusRing,
      shape,
      current
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.nav
        aria-label={text.navigation}
        className={fill ? "flex w-full justify-center self-start" : undefined}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {compact ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={text.previous}
              disabled={page <= 1}
              className={arrowClasses}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              {interpolate(beforePage, { total: String(total) })}
              <span className="font-medium text-foreground">{page}</span>
              {interpolate(afterPage, { total: String(total) })}
            </span>
            <button
              type="button"
              aria-label={text.next}
              disabled={page >= total}
              className={arrowClasses}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <ul className="flex items-center gap-1">
            <li>
              <button
                type="button"
                aria-label={text.previous}
                disabled={page <= 1}
                className={arrowClasses}
              >
                <ChevronLeft className="size-4" />
              </button>
            </li>
            {pageWindow(page, total).map((item, i) => (
              <li key={`${item}-${i}`}>
                {item === "ellipsis" ? (
                  <span className="flex size-8 items-center justify-center text-sm text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-current={item === page ? "page" : undefined}
                    className={pageClasses(item === page)}
                  >
                    {item}
                  </button>
                )}
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-label={text.next}
                disabled={page >= total}
                className={arrowClasses}
              >
                <ChevronRight className="size-4" />
              </button>
            </li>
          </ul>
        )}
      </motion.nav>
    </div>
  );
}
