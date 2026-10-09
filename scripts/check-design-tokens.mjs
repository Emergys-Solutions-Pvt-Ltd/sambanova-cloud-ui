#!/usr/bin/env node
/**
 * Design-token guard.
 *   1. No raw colors (hex, rgb(), hsl(), Tailwind arbitrary colors) outside src/styles/tokens.css.
 *   2. The two light-theme blocks in tokens.css ([data-theme="light"] and the
 *      prefers-color-scheme fallback) declare identical values.
 *
 * Usage: node scripts/check-design-tokens.mjs [files...]   (no args = scan src/)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TOKENS = path.join("src", "styles", "tokens.css");
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".js", ".mjs"]);
// Files that legitimately carry colors: the token source, and generated icon data.
const ALLOWED = new Set([TOKENS]);

const COLOR_PATTERNS = [
  {
    name: "hex color",
    re: /(?<![\w&/-])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b(?!["']?\s*:)/g,
  },
  { name: "rgb()/hsl()", re: /\b(?:rgba?|hsla?|oklch|oklab)\(\s*\d/g },
  {
    name: "Tailwind arbitrary color",
    re: /\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|shadow)-\[(?:#|rgb|hsl)/g,
  },
  {
    name: "named color",
    re: /\b(?:color|background|fill|stroke)\s*:\s*["']?(?:white|black|red|green|blue)\b/g,
  },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(path.relative(ROOT, full));
  }
  return out;
}

const args = process.argv.slice(2).map((file) => path.relative(ROOT, path.resolve(file)));
const files = (args.length ? args : walk(path.join(ROOT, "src"))).filter(
  (file) => file.startsWith("src") && EXTENSIONS.has(path.extname(file)),
);

const problems = [];
for (const file of files) {
  if (ALLOWED.has(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (line.includes("design-tokens-ignore")) return;
    for (const { name, re } of COLOR_PATTERNS) {
      re.lastIndex = 0;
      const match = re.exec(line);
      if (match)
        problems.push(`${file}:${index + 1}  ${name} "${match[0]}"  → use a semantic token`);
    }
  });
}

// Light block parity.
const css = fs.readFileSync(TOKENS, "utf8");
const block = (source, start) => {
  const from = source.indexOf("{", source.indexOf(start)) + 1;
  let depth = 1,
    i = from;
  for (; depth && i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") depth--;
  }
  return source.slice(from, i - 1);
};
const declarations = (text) =>
  Object.fromEntries(
    text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split(";")
      .map((decl) => decl.trim().replace(/\s+/g, " "))
      .filter((decl) => decl.startsWith("--") || decl.startsWith("color-scheme"))
      .map((decl) => [
        decl.slice(0, decl.indexOf(":")).trim(),
        decl.slice(decl.indexOf(":") + 1).trim(),
      ]),
  );
const explicit = declarations(block(css, '[data-theme="light"] {'));
const system = declarations(block(css, ":root:not([data-theme]) {"));
for (const key of new Set([...Object.keys(explicit), ...Object.keys(system)])) {
  if (explicit[key] !== system[key]) {
    problems.push(
      `${TOKENS}  light blocks differ for ${key}: "${explicit[key]}" vs "${system[key]}"`,
    );
  }
}

if (problems.length) {
  console.error(`Design token check failed (${problems.length}):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
// eslint-disable-next-line no-console -- CLI output
console.log(`Design token check passed (${files.length} files).`);
