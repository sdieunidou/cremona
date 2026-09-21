import type { ComponentType } from "react";
import { BlockCard, PreviewFrame, PreviewGrid } from "../components/preview-frame.js";
import { SHELL, BADGE_OUTLINE_MONO } from "../lib/shell-classes.js";
import { blocks, categories, findBlock, stats, thumbnails, type BlockEntry } from "../lib/discovery.js";
import { hydrateProps } from "../lib/icons.js";
import { cn } from "@cremona/core";

export function HomePage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">All visual compositions</h1>
            <p className="max-w-3xl text-sm/relaxed text-muted-foreground">
              Search and explore {stats.blocks} animated, copy-paste coded illustrations with{" "}
              {stats.variants}+ ready made variations across {stats.categories} categories. Click any one
              to preview all of its variations.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {categories.map((cat) => (
            <section key={cat.slug} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-semibold tracking-tight">{cat.category}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {cat.items.map((item) => {
                  const key = `${cat.slug}/${item.file}`;
                  const entry = blocks[key];
                  const href = `/visuals/${cat.slug}/${item.file}`;
                  return (
                    <BlockCard
                      key={key}
                      href={href}
                      onClick={() => onNavigate(href)}
                      title={item.name}
                      description={item.description}
                    >
                      {entry ? (
                        <Thumbnail entry={entry} />
                      ) : (
                        <div className="size-full animate-pulse bg-muted/40" />
                      )}
                    </BlockCard>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Home thumbnails render the live component, masked + isometric like the POC. */
function Thumbnail({ entry }: { entry: BlockEntry }) {
  const defaults = thumbnails[entry.key] ?? {};
  const Animated = entry.Component as ComponentType<Record<string, unknown>>;
  return (
    <Animated
      animated
      trigger="inView"
      className="mask-t-from-85% mask-r-from-85% mask-b-from-85% mask-l-from-85%"
      {...defaults}
    />
  );
}

export function BlockPage({
  category,
  file,
  onNavigate,
}: {
  category: string;
  file: string;
  onNavigate: (to: string) => void;
}) {
  const entry = findBlock(category, file);
  if (!entry) {
    return (
      <section className="relative py-8 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16">
          <p className="text-sm text-muted-foreground">
            This visual is not ported yet. Its spec and golden references exist in{" "}
            <code className="font-mono text-xs">packages/blocks/src/{category}/{file}</code>.
          </p>
        </div>
      </section>
    );
  }
  const { meta, Component, previewProps } = entry;
  void onNavigate;

  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <span data-slot="badge" data-variant="outline" className={BADGE_OUTLINE_MONO}>
              {meta.sourcePath}
            </span>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
              {meta.name}
            </h1>
            <p className="max-w-2xl text-sm/relaxed text-muted-foreground">{meta.description}</p>
          </div>
          <div className="flex shrink-0 items-center" />
        </div>
        <PreviewGrid cols={meta.page?.cols ?? 2}>
          {meta.variants.map((variant) => {
            const props = hydrateProps(previewProps[variant.label] ?? {});
            return (
              <PreviewFrame key={variant.slug} label={variant.label} size={variant.size}>
                <AnimatedVisual entry={entry} props={props} />
              </PreviewFrame>
            );
          })}
        </PreviewGrid>
      </div>
    </section>
  );
}

/** Block-page previews: animated + trigger inViewRepeat (POC default). */
function AnimatedVisual({ entry, props }: { entry: BlockEntry; props: Record<string, unknown> }) {
  const Animated = entry.Component as ComponentType<Record<string, unknown>>;
  return <Animated animated trigger="inViewRepeat" {...props} />;
}
