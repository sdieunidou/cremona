import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Bell, ChevronLeft, MoreVertical, Plus, Search, Share } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type AppBarAction = "search" | "more" | "share" | "bell" | "add";

export interface AppBarProps extends VisualProps {
  title?: string;
  /** iOS-style large title under the bar. */
  large?: boolean;
  /** Content scrolled under the bar: it gets a shadow and a translucent background. */
  scrolled?: boolean;
  /** Show the back button. */
  back?: boolean;
  /** Trailing icon buttons, in order. */
  actions?: AppBarAction[];
  /** Accessible names of the icon buttons. */
  actionLabels?: Partial<Record<AppBarAction | "back", string>>;
}

const icons: Record<AppBarAction, LucideIcon> = {
  search: Search,
  more: MoreVertical,
  share: Share,
  bell: Bell,
  add: Plus,
};

const defaultActionLabels: Record<AppBarAction | "back", string> = {
  back: "Back",
  search: "Search",
  more: "More options",
  share: "Share",
  bell: "Notifications",
  add: "Add",
};

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const barIn = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const chipIn = (i: number): Variants => ({
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, delay: 0.15 + i * 0.07 },
  },
});

const iconButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AppBar({
  title = "Photos",
  large = false,
  scrolled = false,
  back = true,
  actions = ["search", "more"],
  actionLabels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: AppBarProps) {
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
  const names = { ...defaultActionLabels, ...actionLabels };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.header
        className={cn("w-full", fill && "self-start")}
        variants={animated ? barIn : undefined}
        {...state}
      >
        <div
          className={cn(
            "relative flex h-12 w-full items-center gap-2 border-b px-3",
            scrolled
              ? "border-border bg-background/85 shadow-sm backdrop-blur"
              : "border-border/60 bg-background",
          )}
        >
          {back && (
            <motion.button
              type="button"
              aria-label={names.back}
              className={iconButton}
              variants={animated ? chipIn(0) : undefined}
              {...state}
              {...noFocus}
            >
              <ChevronLeft className="size-4.5" strokeWidth={2} />
            </motion.button>
          )}
          {large ? (
            <div className="flex-1" />
          ) : (
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              {title}
            </h2>
          )}
          <div className="flex items-center gap-1">
            {actions.map((action, i) => {
              const Icon = icons[action] ?? MoreVertical;
              return (
                <motion.button
                  key={action}
                  type="button"
                  aria-label={names[action]}
                  className={iconButton}
                  variants={animated ? chipIn(i + 1) : undefined}
                  {...state}
                  {...noFocus}
                >
                  <Icon className="size-4.5" strokeWidth={2} />
                </motion.button>
              );
            })}
          </div>
        </div>
        {large && (
          <div className="w-full bg-background px-3 pb-2.5">
            <h2 className="truncate text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          </div>
        )}
      </motion.header>
    </div>
  );
}
