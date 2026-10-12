import { Fragment } from "react";

import { cn } from "@/lib/cn";

/** plain = code text, string = literals such as headers and URLs, value = JSON/argument values. */
export type CodeTokenKind = "plain" | "string" | "value";

export interface CodeToken {
  text: string;
  kind?: CodeTokenKind;
}

export type CodeLine = CodeToken[];

const kindClasses: Record<CodeTokenKind, string> = {
  plain: "text-code-text",
  string: "text-code-string",
  value: "text-code-keyword",
};

interface CodeBlockProps {
  lines: CodeLine[];
  /** Accessible name for the scrollable region, e.g. "curl example". */
  label: string;
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
export function CodeBlock({ lines, label, className }: CodeBlockProps) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(
        "overflow-x-auto rounded-sm border border-strong bg-code p-5 font-code text-code leading-tight whitespace-pre",
        className,
      )}
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
