"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MarketingShellLabels {
  /** Navigation links; `product`, `pricing` and `blog` also title or fill the footer. */
  product: string;
  pricing: string;
  docs: string;
  blog: string;
  /** Header and closing call-to-action button. */
  getStarted: string;
  heroTitle: string;
  heroDescription: string;
  startFree: string;
  bookDemo: string;
  /** Feature tiles: title and line. */
  setupTitle: string;
  setupCopy: string;
  typesTitle: string;
  typesCopy: string;
  motionTitle: string;
  motionCopy: string;
  /** Caption above the customer logos. */
  trustedBy: string;
  ctaTitle: string;
  ctaDescription: string;
  /** Footer columns and links. */
  company: string;
  legal: string;
  features: string;
  changelog: string;
  about: string;
  careers: string;
  privacy: string;
  terms: string;
}

export const marketingShellDefaultLabels: MarketingShellLabels = {
  product: "Product",
  pricing: "Pricing",
  docs: "Docs",
  blog: "Blog",
  getStarted: "Get started",
  heroTitle: "Ship beautiful interfaces faster",
  heroDescription: "Animated, themeable blocks for product teams that care about the details.",
  startFree: "Start free",
  bookDemo: "Book a demo",
  setupTitle: "Instant setup",
  setupCopy: "One command, zero config.",
  typesTitle: "Type-safe",
  typesCopy: "Strict tokens end to end.",
  motionTitle: "Motion built in",
  motionCopy: "Springs that feel right.",
  trustedBy: "Trusted by teams at",
  ctaTitle: "Start building today",
  ctaDescription: "Free for personal projects.",
  company: "Company",
  legal: "Legal",
  features: "Features",
  changelog: "Changelog",
  about: "About",
  careers: "Careers",
  privacy: "Privacy",
  terms: "Terms",
};

export interface MarketingShellProps extends VisualProps {
  /** Render the hero band in the dark palette, whatever the page mode. */
  darkHero?: boolean;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<MarketingShellLabels>;
}

const navLinks = ["product", "pricing", "docs", "blog"] as const;

const features = [
  { icon: Zap, title: "setupTitle", copy: "setupCopy" },
  { icon: ShieldCheck, title: "typesTitle", copy: "typesCopy" },
  { icon: Sparkles, title: "motionTitle", copy: "motionCopy" },
] as const;

const footerColumns = [
  { title: "product", links: ["features", "pricing", "changelog"] },
  { title: "company", links: ["about", "blog", "careers"] },
  { title: "legal", links: ["privacy", "terms"] },
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

function Nav({ text }: { text: MarketingShellLabels }) {
  return (
    <motion.header className="flex h-9 shrink-0 items-center gap-3 border-b px-3" variants={region}>
      <div className="flex items-center gap-1.5">
        <div className="size-3 rounded-md bg-primary" />
        <span className="text-[10px] leading-none font-semibold tracking-tight text-foreground">
          Acme
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        {navLinks.map((link) => (
          <span key={link} className="text-[9px] leading-none text-muted-foreground">
            {text[link]}
          </span>
        ))}
      </div>
      <span className="ml-auto rounded-md bg-primary px-2 py-1 text-[9px] leading-none font-medium text-primary-foreground">
        {text.getStarted}
      </span>
    </motion.header>
  );
}

/** `dark` scopes the dark palette to the hero band: the same tokens, flipped. */
function Hero({ dark, text }: { dark: boolean; text: MarketingShellLabels }) {
  return (
    <motion.section
      className={cn(
        "flex flex-col items-center px-4 pt-3 pb-3.5 text-center",
        dark && "dark bg-background text-foreground",
      )}
      variants={region}
    >
      <p className="text-[13px] leading-tight font-bold tracking-tight text-foreground">
        {text.heroTitle}
      </p>
      <p className="mt-1 text-[9px] leading-snug text-muted-foreground">{text.heroDescription}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="rounded-md bg-primary px-2 py-1 text-[9px] leading-none font-medium text-primary-foreground">
          {text.startFree}
        </span>
        <span className="rounded-md border border-border px-2 py-1 text-[9px] leading-none font-medium text-foreground">
          {text.bookDemo}
        </span>
      </div>
      <div className="mt-2.5 w-4/5 rounded-lg border border-border/75 bg-card p-2 text-left shadow-xs">
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-muted-foreground/30" />
          <div className="size-1.5 rounded-full bg-muted-foreground/30" />
          <div className="size-1.5 rounded-full bg-muted-foreground/30" />
          <div className="ml-1 h-1.5 w-10 rounded-full bg-muted-foreground/15" />
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/25" />
            <div className="h-1.5 w-2/5 rounded-full bg-muted-foreground/12" />
            <div className="mt-0.5 h-3 w-8 rounded bg-primary" />
          </div>
          <div className="flex h-12 flex-1 items-end justify-between gap-0.5">
            {heroBars.map((h, i) => (
              <div key={i} className="w-1 rounded-sm bg-chart-3" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FeatureGrid({ text }: { text: MarketingShellLabels }) {
  return (
    <motion.section className="grid grid-cols-3 gap-2 px-4 py-2.5" variants={subRegions}>
      {features.map(({ icon: Icon, title, copy }) => (
        <motion.div key={title} className="flex flex-col gap-1" variants={region}>
          <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
            <Icon className="size-3 text-primary" strokeWidth={2} />
          </div>
          <span className="text-[9px] leading-none font-semibold text-foreground">
            {text[title]}
          </span>
          <span className="text-[8px] leading-snug text-muted-foreground">{text[copy]}</span>
        </motion.div>
      ))}
    </motion.section>
  );
}

function LogoStrip({ text }: { text: MarketingShellLabels }) {
  return (
    <motion.section className="flex flex-col items-center gap-1.5 py-2" variants={region}>
      <span className="text-[7px] font-semibold tracking-wider text-muted-foreground uppercase">
        {text.trustedBy}
      </span>
      <div className="flex items-center gap-3">
        {["Nova", "Hopper", "Orbit", "Flux", "Arc"].map((name) => (
          <div key={name} className="flex items-center gap-1">
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

function CtaBand({ text }: { text: MarketingShellLabels }) {
  return (
    <motion.section className="px-4 py-2" variants={region}>
      <div className="flex items-center justify-between rounded-lg bg-primary px-2.5 py-2">
        <div className="flex flex-col">
          <span className="text-[9px] leading-tight font-semibold text-primary-foreground">
            {text.ctaTitle}
          </span>
          <span className="text-[8px] leading-tight text-primary-foreground">
            {text.ctaDescription}
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-primary-foreground px-1.5 py-1 text-[8px] leading-none font-medium text-primary">
          {text.getStarted}
          <ArrowRight className="size-2" strokeWidth={2.5} />
        </span>
      </div>
    </motion.section>
  );
}

function Footer({ text }: { text: MarketingShellLabels }) {
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
              {text[col.title]}
            </span>
            {col.links.map((link) => (
              <span key={link} className="text-[8px] leading-tight text-muted-foreground">
                {text[link]}
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
  labels,
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
  const text = { ...marketingShellDefaultLabels, ...labels };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "w-full",
          fill ? "h-full" : "max-w-96",
          "overflow-hidden rounded-xl border bg-background shadow-xs",
        )}
        variants={animated ? shell : undefined}
        {...state}
      >
        <motion.div
          className="flex min-h-0 flex-col"
          variants={animated ? regions : undefined}
          {...state}
        >
          <Nav text={text} />
          <Hero dark={darkHero} text={text} />
          <FeatureGrid text={text} />
          <LogoStrip text={text} />
          <CtaBand text={text} />
          <Footer text={text} />
        </motion.div>
      </motion.div>
    </div>
  );
}
