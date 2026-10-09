# Releasing

Published packages: `@cremona/tokens`, `@cremona/core`, `@cremona/react`,
`@cremona/blocks`, `@cremona/ui`, `@cremona/stimulus`, `@cremona/mcp` — versioned together
(Changesets "fixed" group in `.changeset/config.json`). `@cremona/skill` and
the gallery are private.

## Flow

1. With a change to a published package, in a pull request or straight on
   `main`: `pnpm changeset`, pick the bump, commit the generated
   `.changeset/*.md`. A block change ships in
   `@cremona/blocks` and in the `@cremona/mcp` snapshot, and the fixed group
   releases every package at the same version.
2. Once it is on `main`, the **Release** workflow opens (or updates) the
   "chore: version packages" PR. Merging it bumps versions and changelogs.
3. Publishing is manual: Actions → **Release** → Run workflow on `main` →
   `publish: true`. The job runs only on `main`, in the `npm` environment. It
   runs `pnpm check`, checks the `@cremona/blocks` and `@cremona/ui` tarballs
   (`pnpm --filter @cremona/blocks check:package`, the same for `@cremona/ui`),
   then `pnpm release`
   (`pnpm build` + `changeset publish`, which publishes every version not yet on
   npm and tags it), then pushes the tags.

Authentication is npm **trusted publishing**: the job's OIDC token
(`id-token: write`) is exchanged with npm for a short-lived publish token, so
the repository holds no npm token. Each version is published with a
**provenance** attestation linking it to the commit and the workflow run
(`PNPM_CONFIG_PROVENANCE=true`). The job sets no `registry-url` on
`actions/setup-node`: the `.npmrc` it would write carries an
`${NODE_AUTH_TOKEN}` placeholder that pnpm up to 11.1.2 sends instead of the
OIDC token.

## Repository and npm settings (owner)

These are settings, not code; the workflow needs all of them.

1. **npm scope**: the `cremona` organization on npmjs.com owns `@cremona/*`.
2. **First publish of a package, by a maintainer.** npm attaches a trusted
   publisher only to a package that exists, so the first version of a package
   that is not on npm yet is published by hand, from a clean checkout of `main`
   (the seven packages listed at the top are on npm already; this is for one you
   add):

   ```bash
   pnpm install --frozen-lockfile && pnpm check && pnpm build
   npm login
   pnpm -r publish --access public --otp=<code>   # a fresh 2FA code; a rerun skips what is on npm
   pnpm changeset git-tag && git push --tags
   ```
3. **Trusted publisher, per package** — for each package:

   ```bash
   npm trust github <package> --file release.yml --repo sdieunidou/cremona --env npm --allow-publish
   npm access set mfa=publish <package>   # require 2FA, disallow tokens
   ```

   (each asks for a one-time password), or on npmjs.com → the package →
   Settings → Trusted publishing → GitHub Actions: owner `sdieunidou`, repository
   `cremona`, workflow `release.yml`, environment `npm`, publishing with
   `npm publish` allowed, then "Require two-factor authentication and disallow
   tokens". `npm trust list <package>` shows what is set.
4. **GitHub environment** — Settings → Environments → `npm`: deployment
   branches limited to `main` (optionally, required reviewers: a person then
   approves every publish).
5. **Workflow permissions** — Settings → Actions → General → "Allow GitHub
   Actions to create and approve pull requests", or the version PR cannot be
   opened.
6. **Branch protection** — none is required: pull requests are optional and the
   owner pushes to `main`. CI runs on every push, and publishing is manual from a
   green `main` (step 3 of the flow). A ruleset that forbids force pushes and
   deletion of `main` is still a good idea.

No `NPM_TOKEN` secret is used; delete one if it exists.

## Checking packages before a release

- `pnpm pack` in a package directory shows exactly what it ships (with pnpm
  11, `pnpm publish --dry-run` prints no file list). Each `prepack` builds what
  its package compiles: `dist/` for core, react, blocks and ui (plus the blocks'
  placeholder images), the data snapshot for mcp.
- `pnpm --filter @cremona/blocks check:package` packs `@cremona/blocks` and
  checks the tarball: a compiled `"use client"` entry and types for every
  block, the placeholder images, publint, and attw on every entry (ESM-only
  profile).
- `pnpm --filter @cremona/ui check:package` does the same for `@cremona/ui`: a
  compiled entry and types for every component (`"use client"` where one holds
  state), the registry files, publint, and attw on every entry.
- To try tarballs in an app, install them together with npm:
  `npm i ./cremona-tokens-0.1.0.tgz ./cremona-core-0.1.0.tgz ./cremona-react-0.1.0.tgz ./cremona-blocks-0.1.0.tgz motion lucide-react`
  — npm resolves the packages' dependencies on each other from the tarballs;
  pnpm looks them up on the registry.

## What each package ships

| Package | Content |
|---|---|
| `@cremona/tokens` | `css/cremona.css`, `css/themes.css`, the Inter woff2 files and their `OFL.txt`, `themes.json` |
| `@cremona/core` | compiled `dist/` (JS + `.d.ts`), with the `land-mask` subpath |
| `@cremona/react` | compiled `dist/` (JS + `.d.ts`); React 18.2+ or 19 as a peer dependency |
| `@cremona/blocks` | `dist/<category>/<file>/react.{js,d.ts}` (one `"use client"` entry per block, `pnpm build`), `public/media/placeholders/` (copied from the gallery at pack time), `catalog.json`; react, react-dom, motion and lucide-react as peer dependencies |
| `@cremona/ui` | `dist/<name>.{js,d.ts}` (one entry per component, `pnpm build`), `registry.json` and `r/` (the shadcn registry); react, react-dom and lucide-react as peer dependencies |
| `@cremona/stimulus` | controllers (`src/`, with their `.d.ts`) and generated templates; `@hotwired/stimulus` as a peer dependency |
| `@cremona/mcp` | the server plus a snapshot of blocks, tokens, templates and docs (`data/`, written by `prepack`); authoring tools are only registered inside a cremona checkout |
