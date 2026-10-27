import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";

const repoRoot = process.cwd();
const backendSrc = join(repoRoot, "backend", "src");
const frontendSrc = join(repoRoot, "frontend", "src");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) files.push(full);
  }
  return files;
}

function toPosix(p) {
  return p.split(sep).join("/");
}

/** Relative specifier from `fromDir` to `target` (both absolute), always prefixed with ./ or ../ */
function relSpecifier(fromDir, target) {
  let rel = toPosix(relative(fromDir, target));
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

const backendFiles = walk(backendSrc);
const frontendFiles = walk(frontendSrc);

let changed = 0;
const report = [];

// ---- Step 1: backend-internal "@/..." -> relative to backend/src ----
for (const file of backendFiles) {
  const original = readFileSync(file, "utf8");
  const dir = dirname(file);
  const updated = original.replace(
    /(["'])@\/([^"']+)\1/g,
    (match, quote, rest) => {
      const target = join(backendSrc, rest);
      return `${quote}${relSpecifier(dir, target)}${quote}`;
    },
  );
  if (updated !== original) {
    writeFileSync(file, updated, "utf8");
    changed += 1;
    report.push(`backend  ${toPosix(relative(repoRoot, file))}`);
  }
}

// ---- Step 2: frontend "..../backend/src/..." -> correct relative path ----
for (const file of frontendFiles) {
  const original = readFileSync(file, "utf8");
  const dir = dirname(file);
  const updated = original.replace(
    /(["'])((?:\.\.\/)+)backend\/src\/([^"']+)\1/g,
    (match, quote, dots, rest) => {
      const target = join(backendSrc, rest);
      return `${quote}${relSpecifier(dir, target)}${quote}`;
    },
  );
  if (updated !== original) {
    writeFileSync(file, updated, "utf8");
    changed += 1;
    report.push(`frontend ${toPosix(relative(repoRoot, file))}`);
  }
}

console.log(`Converted ${changed} file(s):`);
for (const line of report) console.log("  " + line);
