import { Link } from "../components/link.js";
import { CodeBlock } from "../components/code-block.js";
import { PageHeading } from "../components/page-heading.js";
import { hasDemo, uiCategories } from "../lib/components.js";

const REGISTRY =
  "npx shadcn@latest registry add @cremona=https://raw.githubusercontent.com/sdieunidou/cremona/main/packages/ui/r/{name}.json";

const CATEGORY_LABELS: Record<string, string> = {
  forms: "Forms",
  actions: "Actions",
  display: "Display",
  feedback: "Feedback",
  layout: "Layout",
  data: "Data",
  navigation: "Navigation",
  disclosure: "Disclosure",
  overlays: "Overlays",
};

/** The index of the @cremona/ui components: what they are, how to take them, one card each. */
export function ComponentsPage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-3">
          <PageHeading className="text-2xl font-bold tracking-tight md:text-3xl">
            UI components
          </PageHeading>
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
            The controls, fields and dialogs an app is made of. Accessible, responsive and styled
            with the same tokens as the blocks, so they follow the theme and the mode of the page.
            Take them as source with the shadcn CLI, or import them from{" "}
            <code className="font-mono text-xs">@cremona/ui</code>.
          </p>
          <div className="grid max-w-3xl gap-2">
            <p className="text-sm font-medium">Once per project</p>
            <CodeBlock code={REGISTRY} label="Command that adds the @cremona registry" />
          </div>
        </div>
        {uiCategories.map(({ category, components }) => (
          <section key={category} aria-labelledby={`category-${category}`} className="grid gap-3">
            <h2 id={`category-${category}`} className="text-lg font-semibold tracking-tight">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {components
                .filter((component) => hasDemo(component.name))
                .map((component) => (
                  <li key={component.name}>
                    <Link
                      to={`/components/${component.name}`}
                      onNavigate={onNavigate}
                      className="flex h-full flex-col gap-1 rounded-lg border border-border/60 bg-card p-4 text-card-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="text-sm font-semibold">{component.title}</span>
                      <span className="text-xs/relaxed text-muted-foreground">
                        {component.description}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
