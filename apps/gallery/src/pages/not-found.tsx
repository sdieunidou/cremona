import { useEffect } from "react";
import { Link } from "../components/link.js";
import { PageHeading } from "../components/page-heading.js";
import { queryWords, searchCatalog, type SearchHit } from "../lib/search.js";

/** Visuals whose name, file or description matches any word of the unknown path. */
function suggestions(path: string): SearchHit[] {
  const scores = new Map<string, SearchHit>();
  for (const word of queryWords(path.replace(/^\/visuals\//, ""))) {
    for (const hit of searchCatalog(word)) {
      const seen = scores.get(hit.key);
      scores.set(hit.key, seen ? { ...seen, score: seen.score + hit.score } : hit);
    }
  }
  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 6);
}

export function NotFound({ path, onNavigate }: { path: string; onNavigate: (to: string) => void }) {
  // keep unknown URLs out of search indexes
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  const matches = suggestions(path);
  const visual = /^\/visuals\/(.+?)\/?$/.exec(path)?.[1];

  return (
    <section className="relative py-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col gap-4">
        <PageHeading className="text-2xl font-bold tracking-tight md:text-3xl">
          Page not found
        </PageHeading>
        <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
          {visual ? (
            <>
              There is no visual named <code className="font-mono text-xs">{visual}</code>.
            </>
          ) : (
            <>
              Nothing lives at <code className="font-mono text-xs">{path}</code>.
            </>
          )}
        </p>
        {matches.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Maybe one of these</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {matches.map((hit) => (
                <li key={hit.key}>
                  <Link
                    to={`/visuals/${hit.key}`}
                    onNavigate={onNavigate}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {hit.item.name}
                  </Link>{" "}
                  <span className="text-muted-foreground">· {hit.group.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-sm">
          <Link to="/" onNavigate={onNavigate} className="underline underline-offset-4">
            Back to all visuals
          </Link>
        </p>
      </div>
    </section>
  );
}
