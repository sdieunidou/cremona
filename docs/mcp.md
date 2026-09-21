# MCP server

The `@cremona/mcp` package exposes the whole library to AI sessions over
stdio. 115 blocks, the design system, authoring tools and coherence
validation — no human in the loop required.

## Install

### Claude Code

```bash
claude mcp add cremona -- node /absolute/path/to/cremona/packages/mcp/bin/cremona-mcp.mjs
```

### opencode

```jsonc
// opencode.json (project) or ~/.config/opencode/config.json (global)
{
  "mcp": {
    "cremona": {
      "type": "local",
      "command": ["node", "/absolute/path/to/cremona/packages/mcp/bin/cremona-mcp.mjs"]
    }
  }
}
```

Run `pnpm install` in the cremona repo first (the server resolves paths
relative to the repo).

## Tools

| Tool | Purpose |
|---|---|
| `list_categories` | 31 categories with block names |
| `list_blocks` | blocks by category/kind, with variant labels + ported status |
| `search_blocks` | full-text over names, descriptions, variants |
| `get_block` | metadata + **exact variant props** + **full React source** + Stimulus template sample |
| `get_golden` | the SSR render reference HTML of one variant |
| `get_themes` / `get_theme` | the 9 themes; one theme's full light+dark CSS |
| `get_design_system` | token list, conventions, frame anatomy |
| `add_category` / `add_block` | scaffold new categories/blocks with conventions |
| `validate` | catalog ↔ blocks ↔ goldens ↔ stimulus coherence |
| `get_guide` | repo guides (porting-guide, architecture…) |

## Notes

- Icon props arrive as `"lucide:Users"` strings — import the icon from
  `lucide-react` in your code.
- `get_block` returns the **complete React source**: copy it into your project
  directly (blocks are self-contained TSX).
- `validate` exits non-zero via `scripts/validate.mjs` in CI:
  `node packages/mcp/scripts/validate.mjs`.
