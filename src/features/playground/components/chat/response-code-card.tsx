"use client";

import { useMemo } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icon/icon";

import { codeLabel, highlightCode } from "../../lib/highlight";

/**
 * Fenced code in an assistant reply (Figma: code card `1398:122195`, compare `1398:120093`):
 * language header with a copy button above highlighted, wrapping monospace code.
 */
export function ResponseCodeCard({ lang, code }: { lang: string; code: string }) {
  const lines = useMemo(() => highlightCode(code, lang), [code, lang]);
  const label = codeLabel(lang);

  return (
    <div className="flex w-full flex-col gap-4 rounded-sm border border-code-response bg-code-response pt-3 pr-4 pb-5 pl-5">
      <div className="flex h-4.5 items-center gap-2.5">
        <Icon name="code" size={18} className="text-primary" />
        <span className="flex-1 text-body leading-tight font-semibold text-primary">{label}</span>
        <CopyButton
          value={code}
          icon="layers-subtract"
          size="code"
          variant="bare"
          label="Copy code"
        />
      </div>
      <CodeBlock variant="bare" lines={lines} label={`${label} code`} />
    </div>
  );
}
