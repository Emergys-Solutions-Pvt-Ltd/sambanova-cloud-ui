"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";

import { type Block, groupBlocks, type Inline, parseMarkdown } from "../../lib/markdown";
import { ResponseCodeCard } from "./response-code-card";

export type ChatVariant = "single" | "compare";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((inline, index) => {
    switch (inline.type) {
      case "strong":
        return (
          <strong key={index} className="font-bold text-primary">
            {inline.text}
          </strong>
        );
      case "em":
        return (
          <em key={index} className="italic">
            {inline.text}
          </em>
        );
      case "code":
        return (
          <code key={index} className="rounded-xs bg-code-response px-1 font-mono text-body">
            {inline.text}
          </code>
        );
      case "link":
        return (
          <a
            key={index}
            href={inline.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link underline underline-offset-4 hover:text-link-hover"
          >
            {inline.text}
          </a>
        );
      default:
        return inline.text;
    }
  });
}

const listClasses = "text-body text-content [&:not(:last-child)]:mb-2 [&>li]:ms-5.25";

function MarkdownBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const content = <Inlines inlines={block.inlines} />;
      if (block.level === 1) return <h3 className="text-heading-sm text-primary">{content}</h3>;
      if (block.level === 4) return <h6 className="text-body font-bold text-primary">{content}</h6>;
      return block.level === 2 ? (
        <h4 className="text-heading-xs text-primary">{content}</h4>
      ) : (
        <h5 className="text-heading-xs text-primary">{content}</h5>
      );
    }
    case "paragraph":
      return (
        <p className="text-body text-content">
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index}>
          <Inlines inlines={item} />
        </li>
      ));
      return block.ordered ? (
        <ol start={block.start} className={cn("list-decimal", listClasses)}>
          {items}
        </ol>
      ) : (
        <ul className={cn("list-disc", listClasses)}>{items}</ul>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-2 border-strong pl-3 text-body text-muted">
          <Inlines inlines={block.inlines} />
        </blockquote>
      );
    case "rule":
      return <hr className="border-t border-subtle" />;
    case "code":
      // Code blocks are lifted into their own section by groupBlocks.
      return null;
  }
}

/**
 * Assistant reply body (Figma: markdown sections `1398:122191` / `1398:122201` and code
 * cards `1398:122195`): prose sections with code cards between them. Streaming-safe: an
 * unclosed fence renders as a code card while it streams.
 */
export function MarkdownContent({ source, variant }: { source: string; variant: ChatVariant }) {
  const sections = useMemo(() => groupBlocks(parseMarkdown(source)), [source]);

  return sections.map((section, index) =>
    section.kind === "code" ? (
      <ResponseCodeCard key={index} lang={section.block.lang} code={section.block.code} />
    ) : (
      <div
        key={index}
        className={cn(
          "flex w-full flex-col gap-2.5 py-4",
          variant === "single" ? "max-w-184.5" : "max-w-[93.3%]",
        )}
      >
        {section.blocks.map((block, blockIndex) => (
          <MarkdownBlock key={blockIndex} block={block} />
        ))}
      </div>
    ),
  );
}
