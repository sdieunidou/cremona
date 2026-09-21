import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Bell, House, Plus, Search, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface TabBarProps extends VisualProps {
  labels?: boolean;
  center?: boolean;
  dark?: boolean;
}

interface TabItem {
  icon: LucideIcon;
  label: string;
  badge?: string;
}

const items: TabItem[] = [
  { icon: House, label: "Home" },
  { icon: Search, label: "Explore" },
  { icon: Bell, label: "Inbox", badge: "3" },
  { icon: User, label: "Profile" },
];

const barIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

const tabIn = (i: number): Variants => ({
  hidden: { opacity: 0, y: 6, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, delay: 0.1 + i * 0.07 },
  },
});

const centerIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 15, delay: 0.26 },
  },
};

export function TabBar({
  labels = false,
  center = false,
  dark = false,
  animated = false,
  trigger = "inView",
  className,
}: TabBarProps) {
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

  const slots: (TabItem | "center")[] = center
    ? [items[0]!, items[1]!, "center", items[2]!, items[3]!]
    : items;
  const activeIndex = 0;

  const barClasses = dark
    ? "border-zinc-800 bg-zinc-900"
    : "border-border bg-popover/95";
  const activeClasses = dark ? "bg-white/10 text-white" : "bg-primary/10 text-primary";
  const idleClasses = dark
    ? "text-zinc-300 hover:text-white"
    : "text-muted-foreground hover:text-foreground";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={cn(
          "mx-auto flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur",
          barClasses,
        )}
        variants={animated ? barIn : undefined}
        {...state}
      >
        {slots.map((slot, i) =>
          slot === "center" ? (
            <motion.button
              key="center"
              type="button"
              aria-label="Create"
              className="flex size-11 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary/90"
              variants={animated ? centerIn : undefined}
              {...state}
            >
              <Plus className="size-5" strokeWidth={2.25} />
            </motion.button>
          ) : (
            <motion.button
              key={slot.label}
              type="button"
              aria-label={slot.label}
              aria-current={i === activeIndex && !center ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-colors duration-200",
                labels
                  ? "w-14 flex-col gap-0.5 rounded-xl py-1"
                  : "size-9",
                i === activeIndex && !center ? activeClasses : idleClasses,
              )}
              variants={animated ? tabIn(i) : undefined}
              {...state}
            >
              <slot.icon className="size-4.5" strokeWidth={2} />
              {labels && (
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    i === activeIndex && !center && "font-medium",
                  )}
                >
                  {slot.label}
                </span>
              )}
              {slot.badge && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-white">
                  {slot.badge}
                </span>
              )}
            </motion.button>
          ),
        )}
      </motion.div>
    </div>
  );
}
