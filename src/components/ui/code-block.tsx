import { Fragment } from "react";

import { cn } from "@/lib/cn";

/**
 * plain = code text, string = literals such as headers and URLs, value = JSON/argument values,
 * accent = numbers and declarations in Playground answers.
 */
export type CodeTokenKind = "plain" | "string" | "value" | "accent";

export interface CodeToken {
  text: string;
  kind?: CodeTokenKind;
}

export type CodeLine = CodeToken[];

const kindClasses: Record<CodeTokenKind, string> = {
  plain: "text-code-text",
  string: "text-code-string",
  value: "text-code-keyword",
  accent: "text-code-accent",
};

/** panel = bordered Quickstart panel; bare = text only, wrapping (Figma: Playground answer code card). */
export type CodeBlockVariant = "panel" | "bare";

const variantClasses: Record<CodeBlockVariant, string> = {
  panel:
    "overflow-x-auto rounded-sm border border-strong bg-code p-5 font-code text-code leading-tight whitespace-pre",
  // The base layer gives <code> the Lato code font, so the inner element inherits the mono stack.
  bare: "overflow-x-auto font-mono text-code leading-4 whitespace-pre-wrap break-words [&>code]:font-[inherit]",
};

interface CodeBlockProps {
  lines: CodeLine[];
  /** Accessible name for the scrollable region, e.g. "curl example". */
  label: string;
  variant?: CodeBlockVariant;
  className?: string;
}

/** Plain text of a snippet, for copy buttons. */
export function codeToString(lines: CodeLine[]) {
  return lines.map((line) => line.map((token) => token.text).join("")).join("\n");
}

/**
 * Themed code panel (Figma: Developer Quickstart). Tokens carry their own
 * color kind, so no highlighter library is needed. Focusable so keyboard
 * users can scroll long lines.
 */
export function CodeBlock({ lines, label, variant = "panel", className }: CodeBlockProps) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(variantClasses[variant], className)}
    >
      <code>
        {lines.map((line, index) => (
          <Fragment key={index}>
            {line.map((token, tokenIndex) => (
              <span key={tokenIndex} className={kindClasses[token.kind ?? "plain"]}>
                {token.text}
              </span>
            ))}
            {index < lines.length - 1 && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
