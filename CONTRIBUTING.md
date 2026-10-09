# Contributing to Cremona

## Setup

- Node 22 or later (CI tests 22 and 24) and pnpm 11: `corepack enable` gives
  the version `package.json` pins.
- `pnpm install`, then `pnpm dev`: the gallery at http://localhost:5173.
- For the end-to-end tests, install Playwright's Chromium once:
  `pnpm --filter @cremona/gallery exec playwright install chromium`.

Nothing needs a build inside the repo: the gallery and the tests read the
TypeScript sources ([architecture.md](docs/architecture.md)).

## Before you push

```bash
pnpm check            # lint, format, types, "use client", api.json, tests, validate
pnpm format           # fix formatting
```

When you change a block, also run the generators and commit what they write:
`pnpm test` (it writes the goldens of new variants),
`pnpm generate:api`, `pnpm generate:stimulus` and `pnpm build:css`. CI runs them
again and fails on any changed or untracked generated file. For a gallery
change, run `pnpm gallery:build && pnpm e2e` (`E2E_PORT` sets the port): every
block page must render without a console error, and the gallery chrome must
pass axe in light and dark.

[AGENTS.md](AGENTS.md) lists every command and what CI runs.

## Rules

The invariants in [AGENTS.md](AGENTS.md#non-negotiable-invariants) apply to
everyone: goldens are regression locks, generated files are never edited by
hand, parity is a gate, blocks use semantic tokens, render text as JSX and
never read the clock while rendering. Docs are in English and describe the
current state.

## Adding or changing a block

- [docs/adding-blocks.md](docs/adding-blocks.md) — the workflow, step by step.
- [docs/authoring-guide.md](docs/authoring-guide.md) — the contract for a new
  block: anatomy, tokens, motion, scale, variants, tests.

The MCP server scaffolds a category or a block from a checkout (`add_category`,
`add_block`): an MCP client started at the repo root picks the server up from
`.mcp.json` or `opencode.json` ([docs/mcp.md](docs/mcp.md)).

## Pull requests

- Commit messages follow Conventional Commits: `feat(blocks): …`,
  `fix(stimulus): …`, `docs: …`.
- A change to a published package comes with a changeset (`pnpm changeset`):
  see [docs/releasing.md](docs/releasing.md).
- CI must be green: lint, types and tests on Node 22 and 24, and the gallery
  e2e.
