import { Suspense, use, useRef, useState } from "react";
import { categories, hasBlock, loadComponent, stats, thumbnails } from "../lib/discovery.js";
import { useNearViewport } from "../lib/viewport.js";
import { ErrorBoundary, PreviewError } from "../components/error-boundary.js";
import { Link } from "../components/link.js";
import { PageHeading } from "../components/page-heading.js";

export function HomePage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <PageHeading className="text-2xl font-bold tracking-tight md:text-3xl">
              All visual compositions
            </PageHeading>
            <p className="max-w-3xl text-sm/relaxed text-muted-foreground">
              Search and explore {stats.blocks} animated, copy-paste coded blocks with{" "}
              {stats.variants.toLocaleString("en-US")} ready-made variants across {stats.categories}{" "}
              categories. Hover a card to play its animation, open it to preview every variant and
              copy its code.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {categories.map((cat) => (
            <section
              key={cat.slug}
              aria-labelledby={`category-${cat.slug}`}
              className="flex flex-col gap-3"
            >
              <h2 id={`category-${cat.slug}`} className="font-semibold tracking-tight">
                {cat.category}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {cat.items.map((item) => (
                  <li key={item.file} className="flex">
                    <BlockCard
                      blockKey={`${cat.slug}/${item.file}`}
                      title={item.name}
                      description={item.description}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Home card: a container whose title link stretches over the whole card, so the
 * preview inside (which renders links and buttons of its own) is never nested in
 * a link. The preview mounts when the card nears the viewport, renders its static
 * final state, and replays its animation while the card is hovered or focused.
 */
function BlockCard({
  blockKey,
  title,
  description,
  onNavigate,
}: {
  blockKey: string;
  title: string;
  description: string;
  onNavigate: (to: string) => void;
}) {
  const media = useRef<HTMLDivElement>(null);
  const near = useNearViewport(media);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [plays, setPlays] = useState(0);
  const playing = hovered || focused;
  const start = (set: (v: boolean) => void) => () => {
    if (!playing) setPlays((n) => n + 1);
    set(true);
  };

  return (
    <div
      className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-border/50 hover:border-border active:border-border/75 has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50"
      onPointerEnter={start(setHovered)}
      onPointerLeave={() => setHovered(false)}
      onFocus={start(setFocused)}
      onBlur={() => setFocused(false)}
    >
      <div
        ref={media}
        inert
        data-thumbnail={near ? (playing ? "playing" : "static") : "pending"}
        className="relative flex h-72 items-center justify-center overflow-hidden bg-muted/20 [content-visibility:auto] dark:bg-muted/15"
      >
        {near && hasBlock(blockKey) && (
          <ErrorBoundary fallback={(error) => <PreviewError error={error} />}>
            <Suspense fallback={null}>
              <Thumbnail
                key={playing ? `play-${plays}` : "static"}
                blockKey={blockKey}
                animated={playing}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
      <div className="border-t border-border/50 px-3 py-2.5">
        <h3 className="text-sm font-medium">
          <Link
            to={`/visuals/${blockKey}`}
            onNavigate={onNavigate}
            className="outline-none after:absolute after:inset-0 after:z-10"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-0.75 line-clamp-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/** The block itself, masked like the POC: its final state, or its entrance while `animated`. */
function Thumbnail({ blockKey, animated }: { blockKey: string; animated: boolean }) {
  const { Component } = use(loadComponent(blockKey));
  return (
    <Component
      animated={animated}
      trigger="mount"
      className="mask-t-from-85% mask-r-from-85% mask-b-from-85% mask-l-from-85%"
      {...thumbnails[blockKey]}
    />
  );
}
