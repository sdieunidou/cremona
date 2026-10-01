/** Raw block sources and Stimulus templates, each fetched on demand (the code panel imports this lazily). */
const reactRawModules = import.meta.glob<string>("../../../../packages/blocks/src/*/*/react.tsx", {
  query: "?raw",
  import: "default",
});
const stimRawModules = import.meta.glob<string>(
  "../../../../packages/stimulus/templates/*/*/*.html",
  { query: "?raw", import: "default" },
);

export function loadReactSource(key: string): Promise<string | null> {
  const load = reactRawModules[`../../../../packages/blocks/src/${key}/react.tsx`];
  return load ? load() : Promise.resolve(null);
}

export function loadStimulusTemplate(key: string, slug: string): Promise<string | null> {
  const load = stimRawModules[`../../../../packages/stimulus/templates/${key}/${slug}.html`];
  return load ? load() : Promise.resolve(null);
}
