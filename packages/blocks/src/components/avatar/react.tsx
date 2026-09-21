import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface AvatarProps extends VisualProps {
  /** Initials shown when there is no image. */
  fallback?: string;
  img?: boolean;
  presence?: "online" | "away" | "busy" | "offline";
  ring?: boolean;
  sizes?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

const presenceClasses: Record<string, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  busy: "bg-red-500",
  offline: "bg-muted-foreground",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

function Circle({
  size = "lg",
  fallback = "SC",
  img = false,
  presence,
  ring = false,
}: {
  size?: "sm" | "md" | "lg";
  fallback?: string;
  img?: boolean;
  presence?: AvatarProps["presence"];
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0",
        ring && "rounded-full ring-2 ring-primary/40",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
          sizeClasses[size],
        )}
      >
        {img ? (
          <img
            src="/media/placeholders/avatar-01.jpg"
            alt={fallback}
            className="size-full object-cover"
          />
        ) : (
          fallback
        )}
      </span>
      {presence && (
        <span
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
  img = false,
  presence,
  ring = false,
  sizes = false,
  animated = false,
  trigger = "inView",
  className,
}: AvatarProps) {
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
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
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
          <Circle size="lg" fallback={fallback} img={img} presence={presence} ring={ring} />
        )}
      </motion.div>
    </div>
  );
}
