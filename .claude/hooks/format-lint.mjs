// Hook PostToolUse (Write|Edit): Prettier en todo archivo, ESLint --fix en JS/TS.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, isAbsolute, resolve, extname } from "node:path";

const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());

let input = "";
for await (const chunk of process.stdin) input += chunk;

const file = JSON.parse(input || "{}").tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);

// Solo archivos dentro de este proyecto.
const rel = relative(root, resolve(file));
if (rel.startsWith("..") || isAbsolute(rel)) process.exit(0);

const run = (args) =>
  spawnSync("npx", args, { cwd: root, encoding: "utf8", shell: true });

run(["prettier", "--write", "--ignore-unknown", `"${file}"`]);

if (/\.(m|c)?[jt]sx?$/.test(extname(file))) {
  const lint = run(["eslint", "--fix", `"${file}"`]);
  if (lint.status !== 0) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `ESLint reporta errores en ${rel}:\n${lint.stdout}${lint.stderr}`,
        },
      }),
    );
  }
}
