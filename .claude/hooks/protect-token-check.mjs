// PreToolUse hook: refuse any change to mcp/src/token-check.ts.
// Blocks file-edit tools, and shell commands that write to the file.
// A command that merely mentions the file (git add, cat, grep...) is allowed.
import path from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = "token-check.ts";

const input = JSON.parse(await new Promise((resolve) => {
  let s = "";
  process.stdin.on("data", (c) => (s += c));
  process.stdin.on("end", () => resolve(s || "{}"));
}));

const deny = (why) => {
  console.error(`Blocked: ${PROTECTED} is protected and may not be changed (${why}).`);
  process.exit(2);
};

const cwd = input.cwd ?? process.cwd();
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? cwd;
const protectedPath = path.resolve(projectDir, PROTECTED);
const tool = input.tool_name;
const args = input.tool_input ?? {};

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const p = args.file_path ?? args.notebook_path;
  if (p && path.resolve(cwd, p) === protectedPath) deny(`${tool} on the file`);
}

if (tool === "Bash" && typeof args.command === "string" && args.command.includes(NAME)) {
  const cmd = args.command;
  // Redirection into the file: > file, >> file, >| file
  if (new RegExp(`>[|>]?\\s*["']?[^\\s;&|"']*${NAME.replace(".", "\\.")}`).test(cmd)) {
    deny("shell redirection into it");
  }
  // Split into simple commands and look at each one that names the file.
  for (const seg of cmd.split(/&&|\|\||;|\||\n/)) {
    if (!seg.includes(NAME)) continue;
    const words = seg.trim().split(/\s+/).map((w) => w.replace(/^["']|["']$/g, ""));
    const verbs = words.filter((w) => !/^[A-Za-z_]+=/.test(w) && w !== "sudo" && w !== "env");
    const cmdName = path.basename(verbs[0] ?? "");
    const last = words[words.length - 1] ?? "";
    const lastIsFile = last.endsWith(NAME);
    const has = (re) => re.test(seg);
    if (
      ["tee", "rm", "truncate", "unlink", "shred", "touch", "chmod", "chown"].includes(cmdName) ||
      (["mv", "cp", "install", "ln", "rsync"].includes(cmdName) && (lastIsFile || cmdName === "mv")) ||
      (cmdName === "sed" && has(/\s-[A-Za-z]*i|--in-place/)) ||
      (["perl", "ruby"].includes(cmdName) && has(/\s-[A-Za-z]*i/)) ||
      (cmdName === "dd" && has(/\bof=\S*token-check\.ts/)) ||
      (cmdName === "git" && ["checkout", "restore", "apply", "rm", "mv", "reset"].includes(verbs[1])) ||
      (cmdName === "patch")
    ) {
      deny(`'${cmdName}' would write to it`);
    }
    // Inline scripts that name the file and write/delete something.
    if (
      ["node", "python", "python3", "bash", "sh", "fish", "deno", "bun", "tsx"].includes(cmdName) &&
      has(/write|open\(|unlink|rename|rm\b|>/i)
    ) {
      deny("inline script that appears to write to it");
    }
  }
}
process.exit(0);
