# Releasing

Published packages: `@cremona/tokens`, `@cremona/core`, `@cremona/react`,
`@cremona/stimulus`, `@cremona/mcp` — versioned together (Changesets "fixed"
group). `@cremona/blocks`, `@cremona/skill` and the gallery are private.

## Flow

1. In the PR that changes a published package: `pnpm changeset`, pick the bump,
   commit the generated `.changeset/*.md`.
2. After merge, the **Release** workflow opens (or updates) the
   "chore: version packages" PR. Merging it bumps versions and changelogs.
3. Publishing is manual: Actions → **Release** → Run workflow → `publish: true`.
   It runs `pnpm check`, then `pnpm release` (`pnpm build` + `changeset publish`,
   which publishes every version not yet on npm and tags it), then pushes the tags.

## Requirements

- npm organization `cremona`, and a repository secret `NPM_TOKEN` (granular
  token with read/write on the `@cremona` scope).
- `pnpm -r publish --dry-run --no-git-checks` shows what would be published.

## What each package ships

| Package | Content |
|---|---|
| `@cremona/tokens` | `css/cremona.css`, `css/themes.css`, the Inter woff2 files, `themes.json` |
| `@cremona/core` | compiled `dist/` (JS + `.d.ts`) |
| `@cremona/react` | compiled `dist/` (JS + `.d.ts`), React as a peer dependency |
| `@cremona/stimulus` | controllers (`src/`) and generated templates; `@hotwired/stimulus` as a peer dependency |
| `@cremona/mcp` | the server plus a snapshot of blocks, tokens, templates and docs (`data/`, written by `prepack`); authoring tools are only registered inside a cremona checkout |
