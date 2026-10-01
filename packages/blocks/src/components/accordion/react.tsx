"use client";

import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronDown, CreditCard, Users, Code, LifeBuoy, type LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface AccordionItem {
  title: string;
  content: string;
  icon?: LucideIcon;
}

export interface AccordionProps extends VisualProps {
  /** Number of items shown (default 3). */
  count?: number;
  /** Show a leading icon per item. */
  icons?: boolean;
  /** The items (default: a billing FAQ). */
  items?: AccordionItem[];
  /** Index of the item open on first render (-1: none). */
  active?: number;
  /** Full width and height of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const demoItems: AccordionItem[] = [
  {
    title: "Can I change plans later?",
    content:
      "Yes — upgrades apply immediately and are prorated. Downgrades take effect on your next billing cycle.",
    icon: CreditCard,
  },
  {
    title: "How do seat limits work?",
    content:
      "Every plan includes a base number of seats. Invited viewers are free and never count against your limit.",
    icon: Users,
  },
  {
    title: "Is there an API?",
    content:
      "A fully documented REST API ships with every plan, including webhooks and 30-day usage exports.",
    icon: Code,
  },
  {
    title: "Do you offer support?",
    content:
      "Email support on every plan. Pro and above add a shared Slack channel with a four-hour first response.",
    icon: LifeBuoy,
  },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Accordion({
  count,
  icons = false,
  items,
  active = 0,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: AccordionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(active);
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

  const source = items ?? demoItems;
  const shown = source.slice(0, Math.max(1, count ?? (items ? source.length : 3)));

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "w-full",
          !fill && "max-w-sm",
          "divide-y divide-border overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {shown.map((item, i) => {
          const isOpen = open === i;
          const Icon = item.icon;
          const triggerId = `${id}-trigger-${i}`;
          const panelId = `${id}-panel-${i}`;
          return (
            <div key={`${item.title}-${i}`}>
              <h3>
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  {icons && Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="flex-1">{item.title}</span>
                  <motion.span
                    initial={{ rotate: isOpen ? 180 : 0 }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </button>
              </h3>
              <motion.div
                role="region"
                id={panelId}
                aria-labelledby={triggerId}
                aria-hidden={!isOpen || undefined}
                className="overflow-hidden"
                initial={isOpen ? false : { height: 0 }}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <p className="px-4 pb-4 text-xs leading-5 text-muted-foreground">{item.content}</p>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
