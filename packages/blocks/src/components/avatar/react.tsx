"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type Presence = "online" | "away" | "busy" | "offline";

export interface AvatarProps extends VisualProps {
  /** Initials shown when there is no image. */
  fallback?: string;
  /** Image URL. */
  src?: string;
  /** Image text alternative (default: `fallback`). */
  alt?: string;
  /** @deprecated Demo placeholder photo; use `src`. */
  img?: boolean;
  size?: "sm" | "md" | "lg";
  presence?: Presence;
  ring?: boolean;
  /** Showcase: the three sizes side by side. */
  sizes?: boolean;
  /** Stays centred in the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const PLACEHOLDER = "/media/placeholders/avatar-01.jpg";

const sizeClasses: Record<string, string> = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

const presenceClasses: Record<Presence, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground",
};

const presenceLabels: Record<Presence, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

function Circle({
  size = "lg",
  fallback = "SC",
  src,
  alt,
  presence,
  ring = false,
}: {
  size?: "sm" | "md" | "lg";
  fallback?: string;
  src?: string;
  alt?: string;
  presence?: Presence;
  ring?: boolean;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", ring && "rounded-full ring-2 ring-primary/40")}
    >
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
          sizeClasses[size],
        )}
      >
        {src ? (
          <img src={src} alt={alt ?? fallback} className="size-full object-cover" />
        ) : (
          fallback
        )}
      </span>
      {presence && (
        <span
          role="img"
          aria-label={presenceLabels[presence]}
          className={cn(
            "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
            presenceClasses[presence],
          )}
        />
      )}
    </span>
  );
}

export function Avatar({
  fallback = "SC",
  src,
  alt,
  img = false,
  size = "lg",
  presence,
  ring = false,
  sizes = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: AvatarProps) {
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

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={fill ? "self-center" : undefined}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {sizes ? (
          <div className="flex items-end gap-2.5">
            <Circle size="sm" fallback={fallback} />
            <Circle size="md" fallback={fallback} />
            <Circle size="lg" fallback={fallback} />
          </div>
        ) : (
          <Circle
            size={size}
            fallback={fallback}
            src={src ?? (img ? PLACEHOLDER : undefined)}
            alt={alt}
            presence={presence}
            ring={ring}
          />
        )}
      </motion.div>
    </div>
  );
}
