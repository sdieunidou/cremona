import { use } from "react";
import { PreviewGrid } from "../components/preview-frame.js";
import { PreviewWithCode } from "../components/preview-with-code.js";
import { PageHeading } from "../components/page-heading.js";
import { PropsReference } from "../components/props-reference.js";
import { BADGE_OUTLINE_MONO } from "../lib/shell-classes.js";
import { loadBlock } from "../lib/discovery.js";
import { importPath } from "../lib/code.js";
import { hydrateProps } from "../lib/icons.js";

/** One block: every variant in its preview frame, with its code. Loaded as its own chunk. */
export default function BlockPage({ blockKey }: { blockKey: string }) {
  const entry = use(loadBlock(blockKey));
  const { meta, previewProps, Component } = entry;

  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span data-slot="badge" data-variant="outline" className={BADGE_OUTLINE_MONO}>
            {importPath(entry.key)}
          </span>
          <PageHeading className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            {meta.name}
          </PageHeading>
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">{meta.description}</p>
        </div>
        <PreviewGrid cols={meta.page?.cols ?? 2}>
          {meta.variants.map((variant) => (
            <PreviewWithCode
              key={variant.slug}
              entry={entry}
              label={variant.label}
              size={variant.size}
            >
              {/* block-page previews: animated + trigger inViewRepeat */}
              <Component
                animated
                trigger="inViewRepeat"
                {...hydrateProps(previewProps[variant.label] ?? {})}
              />
            </PreviewWithCode>
          ))}
        </PreviewGrid>
        {entry.api ? <PropsReference api={entry.api} name={meta.name} /> : null}
      </div>
    </section>
  );
}
