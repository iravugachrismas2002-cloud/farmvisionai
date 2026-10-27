import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, sep, resolve } from "node:path";

const repoRoot = process.cwd();
const backendSrc = join(repoRoot, "backend", "src");
const frontendSrc = join(repoRoot, "frontend", "src");

// Directories holding machine-generated code. The Prisma client emits doc comments
// that mention module specifiers such as "./generated/prisma/client"; those are prose,
// not real imports, so they must not be resolved against the filesystem.
const IGNORED_DIRS = new Set(["generated", "node_modules", ".next", "dist", "build"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      walk(full, files);
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

function toPosix(p) {
  return p.split(sep).join("/");
}

/**
 * Strip comments so that prose inside them is never mistaken for an import.
 * Line comments avoid matching "://" (e.g. inside a URL).
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

const files = [...walk(backendSrc), ...walk(frontendSrc)];
const problems = [];
let checked = 0;

const SPECIFIER = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

for (const file of files) {
  const source = stripComments(readFileSync(file, "utf8"));
  const dir = dirname(file);
  for (const match of source.matchAll(SPECIFIER)) {
    const spec = match[1];
    if (!spec.startsWith(".")) continue;
    checked += 1;
    const base = resolve(dir, spec);
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.d.ts`,
      join(base, "index.ts"),
      join(base, "index.tsx"),
    ];
    if (!candidates.some((c) => existsSync(c))) {
      problems.push(`${toPosix(relative(repoRoot, file))} -> ${spec}`);
    }
  }
}

console.log(`Checked ${checked} relative import(s) across ${files.length} file(s).`);
if (problems.length === 0) {
  console.log("OK: every relative import resolves to an existing file.");
} else {
  console.log(`BROKEN (${problems.length}):`);
  for (const p of problems) console.log("  " + p);
  process.exitCode = 1;
}
