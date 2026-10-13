import { type CodeLine, type CodeTokenKind } from "@/components/ui/code-block";

/**
 * Small line-based code tokenizer for answer code cards (Figma: code card
 * `1398:122195`, chat-b §7). Three colours: identifiers / types / built-ins →
 * `value`, numbers and TS declaration keywords → `accent`, strings → `string`;
 * keywords, punctuation and comments stay `plain`.
 */

type Family = "js" | "python" | "json" | "bash";

const FAMILIES: Record<string, Family> = {
  js: "js",
  javascript: "js",
  jsx: "js",
  ts: "js",
  typescript: "js",
  tsx: "js",
  python: "python",
  py: "python",
  json: "json",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
};

const LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TypeScript",
  python: "Python",
  py: "Python",
  json: "JSON",
  bash: "Bash",
  sh: "Bash",
  shell: "Bash",
  zsh: "Bash",
};

const words = (list: string) => new Set(list.split(" "));

const JS_KEYWORDS = words(
  "abstract as async await break case catch class const continue debugger default delete do else enum export extends false finally for from function get if implements import in instanceof interface keyof let new of package private protected public readonly return satisfies set static super switch this throw true try type typeof var void while with yield declare namespace",
);
const JS_DECLARATIONS = words("const let var function class interface type");
const TS_DECLARATION_KEYWORDS = words("interface type enum namespace declare");
const JS_VALUES = words(
  "console Math JSON Object Array Promise window document process string number boolean void unknown any never null undefined",
);

const PY_KEYWORDS = words(
  "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self",
);
const PY_DECLARATIONS = words("def class");
const PY_VALUES = words("None True False print len range str int float dict list set tuple");

const JSON_VALUES = words("true false null");

const isIdentStart = (char: string | undefined) => char !== undefined && /[A-Za-z_$]/.test(char);
const isIdentChar = (char: string | undefined) => char !== undefined && /[\w$]/.test(char);
const isPascalCase = (word: string) => /^[A-Z][A-Za-z0-9]*$/.test(word) && /[a-z]/.test(word);

/** Multi-line constructs carried from one line to the next. */
type Carry = null | "block-comment" | { quote: string };

const NUMBER = /^(?:0[xXbBoO][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)n?/;

function classify(
  family: Family,
  word: string,
  previousChar: string | undefined,
  previousWord: string | null,
  rest: string,
): CodeTokenKind {
  const next = rest.trimStart()[0];

  if (family === "json") return JSON_VALUES.has(word) ? "value" : "plain";
  if (family === "bash") return "plain";

  if (previousChar === ".") return "plain";

  if (family === "python") {
    if (previousWord && PY_DECLARATIONS.has(previousWord)) return "value";
    if (PY_KEYWORDS.has(word)) return "plain";
    if (PY_VALUES.has(word) || next === "(" || isPascalCase(word)) return "value";
    return "plain";
  }

  if (TS_DECLARATION_KEYWORDS.has(word) && isIdentStart(next)) return "accent";
  if (previousWord && JS_DECLARATIONS.has(previousWord)) return "value";
  if (JS_KEYWORDS.has(word)) return JS_VALUES.has(word) ? "value" : "plain";
  if (JS_VALUES.has(word) || next === "(" || isPascalCase(word)) return "value";
  return "plain";
}

function tokenizeLine(line: string, family: Family, carry: Carry): [CodeLine, Carry] {
  const tokens: CodeLine = [];
  const push = (text: string, kind: CodeTokenKind) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && (last.kind ?? "plain") === kind) last.text += text;
    else tokens.push({ text, kind });
  };

  let index = 0;
  let previousChar: string | undefined;
  let previousWord: string | null = null;

  /** Consumes a string body from `index` up to (and including) `quote`; returns whether it closed. */
  const readString = (quote: string) => {
    const start = index;
    while (index < line.length) {
      if (line[index] === "\\" && family !== "bash") {
        index += 2;
        continue;
      }
      if (line.startsWith(quote, index)) {
        index += quote.length;
        push(line.slice(start, index), "string");
        return true;
      }
      index++;
    }
    push(line.slice(start), "string");
    return false;
  };

  if (carry === "block-comment") {
    const end = line.indexOf("*/");
    if (end === -1) return [line ? [{ text: line, kind: "plain" }] : [], carry];
    push(line.slice(0, end + 2), "plain");
    index = end + 2;
    carry = null;
  } else if (carry) {
    if (!readString(carry.quote)) return [tokens, carry];
    previousChar = carry.quote[carry.quote.length - 1];
    carry = null;
  }

  while (index < line.length) {
    const char = line[index]!;
    const rest = line.slice(index);

    if (/\s/.test(char)) {
      const run = /^\s+/.exec(rest)![0];
      push(run, "plain");
      index += run.length;
      continue;
    }

    const lineComment =
      (family === "js" && rest.startsWith("//")) ||
      ((family === "python" || family === "bash") &&
        char === "#" &&
        (index === 0 || /\s/.test(line[index - 1]!)));
    if (lineComment) {
      push(rest, "plain");
      break;
    }

    if (family === "js" && rest.startsWith("/*")) {
      const end = line.indexOf("*/", index + 2);
      if (end === -1) {
        push(rest, "plain");
        return [tokens, "block-comment"];
      }
      push(line.slice(index, end + 2), "plain");
      index = end + 2;
      previousChar = "/";
      previousWord = null;
      continue;
    }

    const triple = family === "python" && (rest.startsWith('"""') || rest.startsWith("'''"));
    if (triple || char === '"' || char === "'" || (char === "`" && family === "js")) {
      const quote = triple ? rest.slice(0, 3) : char;
      index += quote.length;
      push(quote, "string");
      const closed = readString(quote);
      if (!closed && (triple || quote === "`")) return [tokens, { quote }];
      previousChar = line[index - 1];
      previousWord = null;
      continue;
    }

    if (/\d/.test(char) && !isIdentChar(line[index - 1])) {
      const number = NUMBER.exec(rest)?.[0] ?? char;
      push(
        number,
        family === "bash" && isIdentChar(line[index + number.length]) ? "plain" : "accent",
      );
      index += number.length;
      previousChar = number[number.length - 1];
      previousWord = null;
      continue;
    }

    if (isIdentStart(char)) {
      const word = /^[A-Za-z_$][\w$]*/.exec(rest)![0];
      const after = line.slice(index + word.length);
      push(word, classify(family, word, previousChar, previousWord, after));
      index += word.length;
      previousChar = word[word.length - 1];
      previousWord = word;
      continue;
    }

    push(char, "plain");
    index++;
    previousChar = char;
    previousWord = null;
  }

  return [tokens, carry];
}

/** Figma colours a run of numbers as one span ("1, 2, 2, 3"): merge comma separators between accents. */
function mergeNumberRuns(line: CodeLine): CodeLine {
  const out: CodeLine = [];
  for (let index = 0; index < line.length; index++) {
    const token = line[index]!;
    const previous = out[out.length - 1];
    const next = line[index + 1];
    if (
      previous?.kind === "accent" &&
      next?.kind === "accent" &&
      (token.kind ?? "plain") === "plain" &&
      /^,\s*$/.test(token.text) &&
      /^\d/.test(next.text) &&
      /\d$/.test(previous.text)
    ) {
      previous.text += token.text + next.text;
      index++;
      continue;
    }
    out.push({ ...token });
  }
  return out;
}

/** Tokenizes `code` into coloured lines for `CodeBlock`. Unknown languages render plain. */
export function highlightCode(code: string, lang: string): CodeLine[] {
  const lines = code.split("\n");
  const family = FAMILIES[lang.toLowerCase()];
  if (!family) return lines.map((line) => (line ? [{ text: line, kind: "plain" }] : []));

  let carry: Carry = null;
  return lines.map((line) => {
    const [tokens, nextCarry] = tokenizeLine(line, family, carry);
    carry = nextCarry;
    return mergeNumberRuns(tokens);
  });
}

/** Header label of a code card: JavaScript | TypeScript | Python | JSON | Bash | Code. */
export function codeLabel(lang: string) {
  return LABELS[lang.toLowerCase()] ?? "Code";
}
