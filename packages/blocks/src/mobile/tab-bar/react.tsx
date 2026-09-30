import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Bell,
  Calendar,
  Compass,
  Heart,
  House,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type TabBarIcon =
  | "home"
  | "search"
  | "bell"
  | "user"
  | "heart"
  | "message"
  | "calendar"
  | "compass"
  | "bag"
  | "settings";

export interface TabBarItem {
  label: string;
  icon: TabBarIcon;
  /** Count bubble, e.g. unread items. */
  badge?: string;
}

export interface TabBarProps extends VisualProps {
  /** Show the text label under each icon. */
  labels?: boolean;
  /** Add a raised create button in the middle. */
  center?: boolean;
  /** Render the bar in the dark palette whatever the page mode. */
  dark?: boolean;
  /** Tabs, left to right (four fit best around the center button). */
  items?: TabBarItem[];
  /** Index of the current tab in `items`. */
  active?: number;
  /** Accessible name of the center button. */
  centerLabel?: string;
}

const icons: Record<TabBarIcon, LucideIcon> = {
  home: House,
  search: Search,
  bell: Bell,
  user: User,
  heart: Heart,
  message: MessageCircle,
  calendar: Calendar,
  compass: Compass,
  bag: ShoppingBag,
  settings: Settings,
};

const defaultItems: TabBarItem[] = [
  { icon: "home", label: "Home" },
  { icon: "search", label: "Explore" },
  { icon: "bell", label: "Inbox", badge: "3" },
  { icon: "user", label: "Profile" },
];

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function TabBar({
  labels = false,
  center = false,
  dark = false,
  items = defaultItems,
  active = 0,
  centerLabel = "Create",
  animated = false,
  trigger = "inView",
  fill = false,
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

  const tabs = items.map((item, index) => ({ item, index }));
  const half = Math.ceil(tabs.length / 2);
  const slots: ((typeof tabs)[number] | "center")[] = center
    ? [...tabs.slice(0, half), "center", ...tabs.slice(half)]
    : tabs;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      {/* `dark` scopes the dark palette to the bar: it keeps the theme's tokens */}
      <motion.nav
        className={cn(
          "flex items-center gap-1 rounded-full border border-border bg-popover/95 px-2 py-1.5 text-popover-foreground shadow-lg backdrop-blur",
          fill ? "w-full justify-around self-end" : "mx-auto",
          dark && "dark",
        )}
        variants={animated ? barIn : undefined}
        {...state}
      >
        {slots.map((slot, i) =>
          slot === "center" ? (
            <motion.button
              key="center"
              type="button"
              aria-label={centerLabel}
              className={cn(
                "flex size-11 shrink-0 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary/90",
                focusRing,
              )}
              variants={animated ? centerIn : undefined}
              {...state}
              {...noFocus}
            >
              <Plus className="size-5" strokeWidth={2.25} />
            </motion.button>
          ) : (
            <TabButton
              key={slot.index}
              item={slot.item}
              current={slot.index === active}
              labels={labels}
              variants={animated ? tabIn(i) : undefined}
              state={state}
            />
          ),
        )}
      </motion.nav>
    </div>
  );
}

function TabButton({
  item,
  current,
  labels,
  variants,
  state,
}: {
  item: TabBarItem;
  current: boolean;
  labels: boolean;
  variants: Variants | undefined;
  state: Record<string, unknown>;
}) {
  const Icon = icons[item.icon] ?? House;
  return (
    <motion.button
      type="button"
      aria-label={labels ? undefined : item.label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full transition-colors duration-200",
        labels ? "min-h-11 w-14 flex-col gap-0.5 rounded-xl py-1" : "size-11",
        current ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
        focusRing,
      )}
      variants={variants}
      {...state}
      {...noFocus}
    >
      <Icon className="size-4.5" strokeWidth={2} />
      {labels && (
        <span className={cn("text-[10px] leading-none", current && "font-medium")}>
          {item.label}
        </span>
      )}
      {item.badge && (
        <span
          className={cn(
            "absolute flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground",
            labels ? "top-0 right-2" : "top-1 right-1",
          )}
        >
          {item.badge}
        </span>
      )}
    </motion.button>
  );
}
