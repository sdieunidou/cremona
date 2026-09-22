import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MarketingShellProps extends VisualProps {
  /** Render the hero as a dark, brand-filled band. */
  darkHero?: boolean;
}

const navLinks = ["Product", "Pricing", "Docs", "Blog"] as const;

const features = [
  { icon: Zap, title: "Instant setup", copy: "One command, zero config." },
  { icon: ShieldCheck, title: "Type-safe", copy: "Strict tokens end to end." },
  { icon: Sparkles, title: "Motion built in", copy: "Springs that feel right." },
] as const;

const footerColumns = [
  { title: "Product", links: ["Features", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers"] },
  { title: "Legal", links: ["Privacy", "Terms"] },
] as const;

const heroBars = [45, 70, 55, 85, 60, 75, 50] as const;

const shell = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const regions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
} as const;

const subRegions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
} as const;

const region = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

function Nav() {
  return (
    <motion.header
      className="flex h-9 shrink-0 items-center gap-3 border-b px-3"
      variants={region}
    >
      <div className="flex items-center gap-1.5">
        <div className="size-3 rounded-md bg-primary" />
        <span className="text-[10px] leading-none font-semibold tracking-tight text-foreground">
          Acme
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        {navLinks.map((link) => (
          <span key={link} className="text-[9px] leading-none text-muted-foreground">
            {link}
          </span>
        ))}
      </div>
      <span className="ml-auto rounded-md bg-primary px-2 py-1 text-[9px] leading-none font-medium text-primary-foreground">
        Get started
      </span>
    </motion.header>
  );
}

function Hero({ dark }: { dark: boolean }) {
  return (
    <motion.section
      className={cn(
        "flex flex-col items-center px-4 pt-3 pb-3.5 text-center",
        dark && "bg-primary text-primary-foreground",
      )}
      variants={region}
    >
      <p
        className={cn(
          "text-[13px] leading-tight font-bold tracking-tight",
          dark ? "text-primary-foreground" : "text-foreground",
        )}
      >
        Ship beautiful interfaces faster
      </p>
      <p className={cn("mt-1 text-[9px] leading-snug", dark ? "text-primary-foreground/75" : "text-muted-foreground")}>
        Animated, themeable blocks for product teams that care about the details.
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={cn(
            "rounded-md px-2 py-1 text-[9px] leading-none font-medium",
            dark
              ? "bg-primary-foreground text-primary"
              : "bg-primary text-primary-foreground",
          )}
        >
          Start free
        </span>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-[9px] leading-none font-medium",
            dark ? "border border-primary-foreground/30" : "border border-border",
          )}
        >
          Book a demo
        </span>
      </div>
      <div
        className={cn(
          "mt-2.5 w-4/5 rounded-lg border p-2 text-left",
          dark ? "border-primary-foreground/20 bg-primary-foreground/10" : "border-border/75 bg-card shadow-xs",
        )}
      >
        <div className="flex items-center gap-1">
          <div className={cn("size-1.5 rounded-full", dark ? "bg-primary-foreground/30" : "bg-muted-foreground/30")} />
          <div className={cn("size-1.5 rounded-full", dark ? "bg-primary-foreground/30" : "bg-muted-foreground/30")} />
          <div className={cn("size-1.5 rounded-full", dark ? "bg-primary-foreground/30" : "bg-muted-foreground/30")} />
          <div className={cn("ml-1 h-1.5 w-10 rounded-full", dark ? "bg-primary-foreground/20" : "bg-muted-foreground/15")} />
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <div className="flex flex-1 flex-col gap-1">
            <div className={cn("h-1.5 w-3/5 rounded-full", dark ? "bg-primary-foreground/40" : "bg-muted-foreground/25")} />
            <div className={cn("h-1.5 w-2/5 rounded-full", dark ? "bg-primary-foreground/25" : "bg-muted-foreground/12")} />
            <div className={cn("mt-0.5 h-3 w-8 rounded", dark ? "bg-primary-foreground/60" : "bg-primary")} />
          </div>
          <div className="flex h-12 flex-1 items-end justify-between gap-0.5">
            {heroBars.map((h, i) => (
              <div
                key={i}
                className={cn("w-1 rounded-sm", dark ? "bg-primary-foreground/50" : "bg-chart-3")}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FeatureGrid() {
  return (
    <motion.section
      className="grid grid-cols-3 gap-2 px-4 py-2.5"
      variants={subRegions}
    >
      {features.map(({ icon: Icon, title, copy }) => (
        <motion.div key={title} className="flex flex-col gap-1" variants={region}>
          <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
            <Icon className="size-3 text-primary" strokeWidth={2} />
          </div>
          <span className="text-[9px] leading-none font-semibold text-foreground">{title}</span>
          <span className="text-[8px] leading-snug text-muted-foreground">{copy}</span>
        </motion.div>
      ))}
    </motion.section>
  );
}

function LogoStrip() {
  return (
    <motion.section className="flex flex-col items-center gap-1.5 py-2" variants={region}>
      <span className="text-[7px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
        Trusted by teams at
      </span>
      <div className="flex items-center gap-3">
        {["Nova", "Hopper", "Orbit", "Flux", "Arc"].map((name) => (
          <div key={name} className="flex items-center gap-1 opacity-60 grayscale">
            <div className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-[8px] leading-none font-semibold text-muted-foreground">
              {name}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function CtaBand() {
  return (
    <motion.section className="px-4 py-2" variants={region}>
      <div className="flex items-center justify-between rounded-lg bg-primary px-2.5 py-2">
        <div className="flex flex-col">
          <span className="text-[9px] leading-tight font-semibold text-primary-foreground">
            Start building today
          </span>
          <span className="text-[8px] leading-tight text-primary-foreground/70">
            Free for personal projects.
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-primary-foreground px-1.5 py-1 text-[8px] leading-none font-medium text-primary">
          Get started
          <ArrowRight className="size-2" strokeWidth={2.5} />
        </span>
      </div>
    </motion.section>
  );
}

function Footer() {
  return (
    <motion.footer className="flex items-start gap-4 border-t px-4 py-2.5" variants={region}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-md bg-primary" />
          <span className="text-[9px] leading-none font-semibold tracking-tight text-foreground">
            Acme
          </span>
        </div>
        <span className="text-[8px] leading-snug text-muted-foreground">© 2026 Acme Inc.</span>
      </div>
      <div className="flex flex-1 justify-end gap-4">
        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col gap-0.5">
            <span className="text-[8px] leading-none font-semibold text-foreground">
              {col.title}
            </span>
            {col.links.map((link) => (
              <span key={link} className="text-[8px] leading-tight text-muted-foreground">
                {link}
              </span>
            ))}
          </div>
        ))}
      </div>
    </motion.footer>
  );
}

export function MarketingShell({
  darkHero = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: MarketingShellProps) {
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
        className={cn("w-full", !fill && "max-w-96", "overflow-hidden rounded-xl border bg-background shadow-xs")}
        variants={animated ? shell : undefined}
        {...state}
      >
        <motion.div
          className="flex min-h-0 flex-col"
          variants={animated ? regions : undefined}
          {...state}
        >
          <Nav />
          <Hero dark={darkHero} />
          <FeatureGrid />
          <LogoStrip />
          <CtaBand />
          <Footer />
        </motion.div>
      </motion.div>
    </div>
  );
}
