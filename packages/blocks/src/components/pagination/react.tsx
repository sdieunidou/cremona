import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface PaginationProps extends VisualProps {
  page?: number;
  total?: number;
  compact?: boolean;
  rounded?: boolean;
}

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
  compact = false,
  rounded = false,
  animated = false,
  trigger = "inView",
  className,
}: PaginationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const shape = rounded ? "rounded-full" : "rounded-md";
  const arrowClasses = cn(
    "inline-flex size-8 items-center justify-center border border-border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
    shape,
  );
  const pageClasses = (current: boolean) =>
    cn(
      "inline-flex size-8 items-center justify-center border text-sm font-medium shadow-xs transition-colors",
      shape,
      current
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.nav
        aria-label="Pagination"
        variants={animated ? entrance : undefined}
        {...state}
      >
        {compact ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              className={arrowClasses}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              {total}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= total}
              className={arrowClasses}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <ul className="flex items-center gap-1">
            <li>
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                className={arrowClasses}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
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
                aria-label="Next page"
                disabled={page >= total}
                className={arrowClasses}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        )}
      </motion.nav>
    </div>
  );
}
