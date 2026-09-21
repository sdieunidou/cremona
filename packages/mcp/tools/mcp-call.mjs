#!/usr/bin/env node
/**
 * Tiny JSON-RPC client for the Cremona MCP server (stdio).
 * Usage:
 *   node packages/mcp/tools/mcp-call.mjs list_categories
 *   node packages/mcp/tools/mcp-call.mjs get_block '{"key":"metrics/stat-card"}'
 *   node packages/mcp/tools/mcp-call.mjs search_blocks '{"query":"kanban"}'
 * Prints the tool result text (JSON or raw) to stdout.
 */
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [, , tool, rawArgs] = process.argv;
if (!tool) {
  console.error("usage: mcp-call.mjs <tool> [json-args]");
  process.exit(1);
}
const args = rawArgs ? JSON.parse(rawArgs) : {};

const server = spawn(process.execPath, [join(here, "../bin/cremona-mcp.mjs")], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let nextId = 1;
const pending = new Map();

server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let index;
  while ((index = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

function send(method, params) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}

const init = await send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "mcp-call", version: "0.0.1" },
});
if (!init.result) {
  console.error("init failed", JSON.stringify(init));
  process.exit(1);
}
await send("notifications/initialized", {});
const res = await send("tools/call", { name: tool, arguments: args });
server.kill();
if (res.error) {
  console.error("error:", res.error.message);
  process.exit(1);
}
for (const part of res.result.content) {
  if (part.type === "text") console.log(part.text);
}
