#!/usr/bin/env node
/** PostToolUse hook: format the file an agent just edited. Never blocks the session. */
import { spawnSync } from "node:child_process";

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const file = JSON.parse(input)?.tool_input?.file_path;
    if (typeof file === "string" && file) {
      spawnSync(
        "pnpm",
        ["exec", "prettier", "--write", "--ignore-unknown", "--log-level=silent", file],
        {
          cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
          stdio: "ignore",
        },
      );
    }
  } catch {
    // formatting is best-effort
  }
  process.exit(0);
});
