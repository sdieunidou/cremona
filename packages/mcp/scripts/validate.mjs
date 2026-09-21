/** Coherence validation CLI (same engine as the MCP validate tool). */
import { validate } from "../src/store.js";

const result = validate();
console.log(`blocks: ${result.blocks} | ported: ${result.ported}`);
if (result.issues.length) {
  console.error(`\n${result.issues.length} ISSUES:`);
  for (const issue of result.issues) console.error(" -", issue);
  process.exit(1);
} else {
  console.log("all coherent ✓");
}
