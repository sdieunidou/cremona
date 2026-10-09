import { use } from "react";
import { CodeBlock } from "../components/code-block.js";
import { ErrorBoundary, PreviewError } from "../components/error-boundary.js";
import { PageHeading } from "../components/page-heading.js";
import { BADGE_OUTLINE_MONO } from "../lib/shell-classes.js";
import { loadDemo, type UiComponent } from "../lib/components.js";

/** One @cremona/ui component: how to take it, its live examples, and the file they come from. Loaded as its own chunk. */
export default function ComponentPage({ component }: { component: UiComponent }) {
  const { examples, source } = use(loadDemo(component.name));
  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-2">
          <span data-slot="badge" data-variant="outline" className={BADGE_OUTLINE_MONO}>
            @cremona/ui/{component.name}
          </span>
          <PageHeading className="text-2xl font-bold tracking-tight md:text-3xl">
            {component.title}
          </PageHeading>
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">{component.description}</p>
        </div>

        <section aria-labelledby="install" className="grid max-w-3xl gap-3">
          <h2 id="install" className="text-lg font-semibold tracking-tight">
            Install
          </h2>
          <CodeBlock
            code={`npx shadcn@latest add @cremona/${component.name}`}
            label="shadcn command"
          />
          <CodeBlock
            code={`npm i @cremona/ui @cremona/tokens lucide-react\n\nimport { … } from "@cremona/ui/${component.name}";`}
            label="npm install and import"
          />
          {component.docs && (
            <p className="text-xs/relaxed text-muted-foreground">{component.docs}</p>
          )}
        </section>

        <section aria-labelledby="examples" className="grid gap-6">
          <h2 id="examples" className="text-lg font-semibold tracking-tight">
            Examples
          </h2>
          {examples.map(({ title, Example }) => (
            <div key={title} className="grid gap-2" data-example={title}>
              <h3 className="text-sm font-medium">{title}</h3>
              <div className="flex min-h-40 flex-wrap items-center justify-center gap-4 rounded-lg border border-border/60 bg-background p-6">
                <ErrorBoundary fallback={(error) => <PreviewError error={error} />}>
                  <Example />
                </ErrorBoundary>
              </div>
            </div>
          ))}
        </section>

        <section aria-labelledby="code" className="grid gap-3">
          <h2 id="code" className="text-lg font-semibold tracking-tight">
            Code of these examples
          </h2>
          <CodeBlock code={source} label={`Code of the ${component.title} examples`} />
        </section>
      </div>
    </section>
  );
}
