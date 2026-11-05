// Every change is shown before it is applied: a tool in mcp/src/tools that calls
// patchSettings must also call showChange. apply-change.ts is exempt (it applies
// a change that preview-change already showed).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "mcp/src/tools";
const exempt = new Set(["apply-change.ts"]);
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const failures: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
  if (exempt.has(file)) continue;
  const src = stripComments(readFileSync(join(dir, file), "utf8"));
  if (/\bpatchSettings\s*\(/.test(src) && !/\bshowChange\s*\(/.test(src)) {
    failures.push(`${join(dir, file)}: calls patchSettings without calling showChange`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("lint: ok");
