import { Fragment, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface BreadcrumbProps extends VisualProps {
  separator?: "chevron" | "slash";
  ellipsis?: boolean;
}

const baseCrumbs = ["Home", "Projects", "Design system", "Tokens"];
const ellipsisCrumbs = ["Home", "Projects", "…", "Design system", "Tokens"];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Breadcrumb({
  separator = "chevron",
  ellipsis = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: BreadcrumbProps) {
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

  const items = ellipsis ? ellipsisCrumbs : baseCrumbs;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.nav
        aria-label="Breadcrumb"
        className="text-sm"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => (
            <Fragment key={`${item}-${i}`}>
              {i > 0 && (
                <li
                  aria-hidden="true"
                  className="flex items-center text-muted-foreground/60"
                >
                  {separator === "slash" ? (
                    <span className="text-xs">/</span>
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </li>
              )}
              <li>
                {item === "…" ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                    …
                  </span>
                ) : (
                  <span
                    aria-current={i === items.length - 1 ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap transition-colors",
                      i === items.length - 1
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </motion.nav>
    </div>
  );
}
