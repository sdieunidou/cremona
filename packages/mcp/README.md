# @cremona/mcp

An [MCP](https://modelcontextprotocol.io) server that gives AI coding sessions
(Claude Code, opencode…) the [Cremona](https://github.com/sdieunidou/cremona)
library: the block catalog, each block's install line, import, props
reference (type, default and description of every prop), exact variant props
and source, the design system, the themes and the stylesheet's location. It runs over stdio from a snapshot of the library bundled in the
package.

```bash
# Claude Code, every project on this machine
claude mcp add cremona -s user -- npx -y @cremona/mcp
```

```jsonc
// opencode.json
{ "mcp": { "cremona": { "type": "local", "command": ["npx", "-y", "@cremona/mcp"] } } }
```

Tools: `list_categories`, `list_blocks`, `search_blocks`, `get_block`,
`get_golden`, `get_themes`, `get_theme`, `get_design_system`, `get_css`,
`get_controller`, `validate`, `get_guide`. Inside a cremona checkout the server
also registers the authoring tools `add_category` and `add_block`.

Install details, the tools and prompt recipes:
[docs/mcp.md](https://github.com/sdieunidou/cremona/blob/main/docs/mcp.md).

Node 22 or later. MIT license.
