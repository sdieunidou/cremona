import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  BatteryFull,
  Camera,
  Flashlight,
  House,
  Search,
  Settings,
  Signal,
  Star,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type PhoneVariant = "app" | "home" | "lockscreen" | "screenshot";

export interface PhoneNotification {
  app: string;
  title: string;
  body: string;
}

export const phoneDefaultCopy: {
  time: string;
  date: string;
  notifications: PhoneNotification[];
} = {
  time: "9:41",
  date: "Monday, May 25",
  notifications: [
    { app: "Messages", title: "Sara Ruiz", body: "Hey! Are we still on for lunch?" },
    { app: "Mail", title: "Team Update", body: "Sprint review moved to 3 PM" },
  ],
};

const dockIcons: { icon: LucideIcon; active: boolean }[] = [
  { icon: House, active: true },
  { icon: Search, active: false },
  { icon: Star, active: false },
  { icon: Settings, active: false },
];

const alertStyles = [
  { accent: "bg-sky-500/20", dot: "bg-sky-500" },
  { accent: "bg-violet-500/20", dot: "bg-violet-500" },
  { accent: "bg-emerald-500/20", dot: "bg-emerald-500" },
  { accent: "bg-amber-500/20", dot: "bg-amber-500" },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const screen = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, delay: 0.2, ease: "easeOut" } },
} as const;

const appIcon = (i: number): Variants => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 18, delay: 0.25 + i * 0.04 },
  },
});

const dock = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.6, ease: "easeOut" } },
} as const;

const alertRow = (i: number): Variants => ({
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, delay: 0.25 + i * 0.06, ease: "easeOut" },
  },
});

const tabBar = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.55, ease: "easeOut" } },
} as const;

const lockscreen = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const notification = (i: number): Variants => ({
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.4 + i * 0.12, ease: "easeOut" },
  },
});

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const appIconVariants = Array.from({ length: 9 }, (_, i) => appIcon(i));
const alertRowVariants = alertStyles.map((_, i) => alertRow(i));

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-[8px] font-semibold text-foreground">9:41</span>
      <div className="flex items-center gap-0.75 text-foreground">
        <Signal className="size-2.5" strokeWidth={2} />
        <Wifi className="size-2.5" strokeWidth={2} />
        <BatteryFull className="size-2.5" strokeWidth={2} />
      </div>
    </div>
  );
}

function AppContent({ animated, state }: { animated: boolean; state: Record<string, unknown> }) {
  return (
    <motion.div
      className="flex h-full flex-col px-2 pt-5 pb-1.5"
      variants={animated ? screen : undefined}
      {...state}
    >
      <StatusBar />
      <div className="mt-2 flex items-center justify-between px-0.5">
        <div className="flex flex-col gap-0.5">
          <div className="h-1.5 w-12 rounded-full bg-foreground/40" />
          <div className="h-1 w-8 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="size-4 rounded-full bg-primary" />
      </div>
      <div className="mt-2 rounded-lg bg-primary/10 p-2">
        <div className="h-1 w-3/5 rounded-full bg-primary/45" />
        <div className="mt-1 h-1 w-2/5 rounded-full bg-primary/25" />
        <div className="mt-1.5 h-2.5 w-10 rounded-md bg-primary" />
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {alertStyles.map((style, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={animated ? alertRowVariants[i] : undefined}
            className={`flex items-center gap-1.5 rounded-md ${style.accent} p-1.5`}
          >
            <div className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1 w-4/5 rounded-full bg-muted-foreground/30" />
              <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/20" />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-auto flex items-center justify-around rounded-lg bg-muted/50 px-1 py-1.5"
        variants={animated ? tabBar : undefined}
        {...state}
      >
        {dockIcons.map(({ icon: Icon, active }, i) => (
          <div
            key={i}
            className={`flex size-5 items-center justify-center rounded-md ${active ? `bg-primary/15 text-primary` : `text-muted-foreground/60`}`}
          >
            <Icon className="size-2.5" strokeWidth={2.5} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function HomeContent({ animated, state }: { animated: boolean; state: Record<string, unknown> }) {
  return (
    <motion.div
      className="flex h-full flex-col px-2 pt-5 pb-1.5"
      variants={animated ? screen : undefined}
      {...state}
    >
      <StatusBar />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={animated ? appIconVariants[i] : undefined}
            className="flex flex-col items-center gap-0.5 will-change-transform"
          >
            <div className="size-7 rounded-lg bg-primary/15 dark:bg-primary/25" />
            <div className="h-0.5 w-5 rounded-full bg-muted-foreground/20" />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-auto flex items-center justify-center gap-1.75 rounded-lg bg-muted/50 px-1 py-1.5"
        variants={animated ? dock : undefined}
        {...state}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="size-7 rounded-md bg-primary/20 dark:bg-primary/30" />
        ))}
      </motion.div>
    </motion.div>
  );
}

export interface PhoneProps extends VisualProps {
  variant?: PhoneVariant;
  image?: string;
  time?: string;
  date?: string;
  notifications?: PhoneNotification[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Phone({
  variant = "app",
  image,
  time = phoneDefaultCopy.time,
  date = phoneDefaultCopy.date,
  notifications = phoneDefaultCopy.notifications,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: PhoneProps) {
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

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={`relative w-44 rounded-[1.5rem] border border-border/50 bg-muted/75 p-1 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-[1.5rem] bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-[1.5rem] bg-background/75 mask-t-from-50%"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative aspect-9/16 w-full overflow-hidden rounded-[1.25rem] bg-background">
          <div className="absolute top-1.5 left-1/2 z-1 h-2.5 w-12 -translate-x-1/2 rounded-full bg-black/75 dark:bg-black" />
          {variant === "screenshot" && image ? (
            <motion.img
              src={image}
              alt=""
              className="size-full object-cover object-top"
              variants={animated ? screen : undefined}
              {...state}
            />
          ) : variant === "lockscreen" ? (
            <div className="relative size-full">
              {image ? (
                <>
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-top"
                  />
                  <div className="absolute inset-0 size-full bg-linear-to-b from-black/30 via-transparent to-black/30" />
                </>
              ) : (
                <div className="absolute inset-0 size-full bg-linear-to-b from-indigo-950 via-purple-900 to-slate-950" />
              )}
              <motion.div
                className="relative flex h-full flex-col px-2.5 pt-6 pb-1.5"
                variants={animated ? lockscreen : undefined}
                {...state}
              >
                <div className="flex flex-col items-center pt-2">
                  <span className="text-2xl font-light tracking-tight text-white drop-shadow-sm">
                    {time}
                  </span>
                  <span className="text-[8px] font-medium text-white/80 drop-shadow-sm">{date}</span>
                </div>
                <div className="mt-auto flex flex-col gap-1 pb-5">
                  {notifications.map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      className="flex flex-col rounded-lg bg-black/60 px-3 py-2"
                      variants={animated ? notification(i) : undefined}
                      {...state}
                    >
                      <span className="text-[7px] font-semibold tracking-wide text-white/70 uppercase">
                        {item.app}
                      </span>
                      <p className="text-[8px] leading-tight font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[7px] leading-tight text-white/70">{item.body}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1">
                  <div className="flex size-5 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <Flashlight className="size-2.5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                    <Camera className="size-2.5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div className="flex justify-center pt-1.5">
                  <div className="h-0.5 w-6 rounded-full bg-white/50" />
                </div>
              </motion.div>
            </div>
          ) : variant === "home" ? (
            <HomeContent animated={animated} state={state} />
          ) : (
            <AppContent animated={animated} state={state} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
