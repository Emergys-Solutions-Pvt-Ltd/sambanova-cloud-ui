/**
 * Tiny streaming-safe markdown parser for assistant replies (Figma: Answer
 * Received `1398:122190`). Line-based; unfinished syntax renders as text and an
 * unclosed fence stays an open code block, so partial output never breaks.
 */

export type Inline =
  | { type: "text" | "strong" | "em" | "code"; text: string }
  | { type: "link"; text: string; href: string };

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; inlines: Inline[] }
  | { type: "paragraph"; inlines: Inline[] }
  | { type: "list"; ordered: boolean; start: number; items: Inline[][] }
  | { type: "code"; lang: string; code: string; open: boolean }
  | { type: "quote"; inlines: Inline[] }
  | { type: "rule" };

export type CodeBlockNode = Extract<Block, { type: "code" }>;

/** Prose runs and code cards, in reading order (Figma: prose sections + code card). */
export type Section = { kind: "prose"; blocks: Block[] } | { kind: "code"; block: CodeBlockNode };

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)/;
const HEADING = /^ {0,3}(#{1,6})(?:\s+(.*?))?\s*$/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const SAFE_HREF = /^(https?:|mailto:)/i;
const ESCAPABLE = "\\`*_[]()#>!-+.{}|~";

const isBlank = (line: string) => line.trim() === "";
const isWordChar = (char: string | undefined) => char !== undefined && /\w/.test(char);
const isSpace = (char: string | undefined) => char === undefined || /\s/.test(char);

function startsBlock(line: string) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    LIST_ITEM.test(line)
  );
}

function pushText(out: Inline[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last?.type === "text") last.text += text;
  else out.push({ type: "text", text });
}

const inlineText = (inlines: Inline[]) => inlines.map((inline) => inline.text).join("");

/** Finds the closing single `*`/`_` delimiter for emphasis, or -1. */
function findEmphasisClose(text: string, from: number, marker: string) {
  for (let index = from; index < text.length; index++) {
    if (text[index] !== marker) continue;
    if (isSpace(text[index - 1])) continue;
    if (marker === "*" && text[index + 1] === "*") {
      index++;
      continue;
    }
    if (marker === "_" && isWordChar(text[index + 1])) continue;
    return index;
  }
  return -1;
}

/** Inline syntax: `code`, **strong**, *em* / _em_, [text](http…). Nested markers are flattened. */
export function parseInlines(text: string): Inline[] {
  const out: Inline[] = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index]!;

    if (char === "\\" && index + 1 < text.length && ESCAPABLE.includes(text[index + 1]!)) {
      pushText(out, text[index + 1]!);
      index += 2;
      continue;
    }

    if (char === "`") {
      let run = 1;
      while (text[index + run] === "`") run++;
      const fence = "`".repeat(run);
      const close = text.indexOf(fence, index + run);
      if (close !== -1 && text[close + run] !== "`") {
        const code = text.slice(index + run, close);
        const trimmed =
          code.length > 1 && code.startsWith(" ") && code.endsWith(" ") ? code.slice(1, -1) : code;
        if (trimmed) {
          out.push({ type: "code", text: trimmed });
          index = close + run;
          continue;
        }
      }
      pushText(out, fence);
      index += run;
      continue;
    }

    if (char === "*" || char === "_") {
      const double = char + char;
      if (text.startsWith(double, index) && !isSpace(text[index + 2])) {
        const close = text.indexOf(double, index + 2);
        if (close > index + 2 && !isSpace(text[close - 1])) {
          const inner = inlineText(parseInlines(text.slice(index + 2, close)));
          out.push({ type: "strong", text: inner });
          index = close + 2;
          continue;
        }
      } else if (
        !text.startsWith(double, index) &&
        !isSpace(text[index + 1]) &&
        !(char === "_" && isWordChar(text[index - 1]))
      ) {
        const close = findEmphasisClose(text, index + 1, char);
        if (close > index + 1) {
          const inner = inlineText(parseInlines(text.slice(index + 1, close)));
          out.push({ type: "em", text: inner });
          index = close + 1;
          continue;
        }
      }
      // Unmatched (possibly still streaming): keep the run as text.
      let run = 1;
      while (text[index + run] === char) run++;
      pushText(out, char.repeat(run));
      index += run;
      continue;
    }

    if (char === "[") {
      const match = /^\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/.exec(text.slice(index));
      if (match) {
        const label = inlineText(parseInlines(match[1]!));
        const href = match[2]!;
        if (SAFE_HREF.test(href)) out.push({ type: "link", text: label, href });
        else pushText(out, label);
        index += match[0].length;
        continue;
      }
    }

    pushText(out, char);
    index++;
  }

  return out;
}

/** Parses markdown into blocks. Pure; memoise by content string at the call site. */
export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!;

    if (isBlank(line)) {
      index++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1]!;
      const closing = new RegExp(`^ {0,3}${marker[0] === "`" ? "`" : "~"}{${marker.length},}\\s*$`);
      const body: string[] = [];
      index++;
      let open = true;
      while (index < lines.length) {
        if (closing.test(lines[index]!)) {
          open = false;
          index++;
          break;
        }
        body.push(lines[index]!);
        index++;
      }
      blocks.push({ type: "code", lang: fence[2]!.toLowerCase(), code: body.join("\n"), open });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = Math.min(heading[1]!.length, 4) as 1 | 2 | 3 | 4;
      const content = (heading[2] ?? "").replace(/\s+#+$/, "");
      blocks.push({ type: "heading", level, inlines: parseInlines(content) });
      index++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      index++;
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (index < lines.length) {
        const quote = QUOTE.exec(lines[index]!);
        if (!quote) break;
        body.push(quote[1]!);
        index++;
      }
      blocks.push({ type: "quote", inlines: parseInlines(body.join("\n").trim()) });
      continue;
    }

    const first = LIST_ITEM.exec(line);
    if (first) {
      const ordered = /\d/.test(first[2]!);
      const baseIndent = first[1]!.length;
      const items: string[] = [];
      let current = first[3]!;
      index++;

      while (index < lines.length) {
        const next = lines[index]!;
        const item = LIST_ITEM.exec(next);

        if (isBlank(next)) {
          // A blank line continues the list only if more of it follows.
          let peek = index + 1;
          while (peek < lines.length && isBlank(lines[peek]!)) peek++;
          const after = lines[peek];
          const afterItem = after === undefined ? null : LIST_ITEM.exec(after);
          const sameList =
            afterItem !== null &&
            afterItem[1]!.length <= baseIndent &&
            /\d/.test(afterItem[2]!) === ordered;
          const indented = after !== undefined && /^\s{2,}\S/.test(after) && !afterItem;
          if (!sameList && !indented) break;
          index = peek;
          continue;
        }

        if (item && item[1]!.length <= baseIndent) {
          if (/\d/.test(item[2]!) !== ordered) break;
          items.push(current);
          current = item[3]!;
          index++;
          continue;
        }

        // Deeper indent (continuation or nested item) folds into the current item.
        if (/^\s/.test(next) || !startsBlock(next)) {
          current += `\n${next.trim()}`;
          index++;
          continue;
        }
        break;
      }
      items.push(current);

      blocks.push({
        type: "list",
        ordered,
        start: ordered ? Number.parseInt(first[2]!, 10) : 1,
        items: items.map((item) => parseInlines(item.trim())),
      });
      continue;
    }

    const body: string[] = [line.trim()];
    index++;
    while (index < lines.length && !isBlank(lines[index]!) && !startsBlock(lines[index]!)) {
      body.push(lines[index]!.trim());
      index++;
    }
    blocks.push({ type: "paragraph", inlines: parseInlines(body.join("\n")) });
  }

  return blocks;
}

/** Runs of non-code blocks become prose sections; each code block becomes its own section. */
export function groupBlocks(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  for (const block of blocks) {
    if (block.type === "code") {
      sections.push({ kind: "code", block });
      continue;
    }
    const last = sections[sections.length - 1];
    if (last?.kind === "prose") last.blocks.push(block);
    else sections.push({ kind: "prose", blocks: [block] });
  }
  return sections;
}

/** Markdown stripped to plain text (for the screen-reader completion announcement). */
export function plainText(src: string) {
  return parseMarkdown(src)
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
        case "quote":
          return inlineText(block.inlines);
        case "list":
          return block.items.map(inlineText).join(" ");
        case "code":
          return block.code;
        case "rule":
          return "";
      }
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
