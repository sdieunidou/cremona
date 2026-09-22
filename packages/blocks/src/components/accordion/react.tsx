import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronDown, CreditCard, Users, Code, LifeBuoy } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface AccordionProps extends VisualProps {
  /** Number of items (3 or 4). */
  count?: number;
  /** Show a leading icon per item. */
  icons?: boolean;
}

const items = [
  {
    title: "Can I change plans later?",
    body: "Yes — upgrades apply immediately and are prorated. Downgrades take effect on your next billing cycle.",
    icon: CreditCard,
  },
  {
    title: "How do seat limits work?",
    body: "Every plan includes a base number of seats. Invited viewers are free and never count against your limit.",
    icon: Users,
  },
  {
    title: "Is there an API?",
    body: "A fully documented REST API ships with every plan, including webhooks and 30-day usage exports.",
    icon: Code,
  },
  {
    title: "Do you offer support?",
    body: "Email support on every plan. Pro and above add a shared Slack channel with a four-hour first response.",
    icon: LifeBuoy,
  },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Accordion({
  count = 3,
  icons = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: AccordionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
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

  const shown = items.slice(0, Math.max(1, Math.min(count, items.length)));

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
        className={cn("w-full", !fill && "max-w-sm", "divide-y divide-border rounded-lg border bg-card text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {shown.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.title}>
              <h3>
                <button
                  type="button"
                  id={`cremona-accordion-trigger-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`cremona-accordion-panel-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
                >
                  {icons && (
                    <item.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="flex-1">{item.title}</span>
                  <motion.span
                    initial={{ rotate: isOpen ? 180 : 0 }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </motion.span>
                </button>
              </h3>
              <motion.div
                role="region"
                id={`cremona-accordion-panel-${i}`}
                aria-labelledby={`cremona-accordion-trigger-${i}`}
                className="overflow-hidden"
                initial={isOpen ? false : { height: 0 }}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <p className="px-4 pb-4 text-xs leading-5 text-muted-foreground">
                  {item.body}
                </p>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
