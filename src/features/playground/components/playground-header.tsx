"use client";

import { type ReactElement, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { selectMode, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { selectSystemPrompt, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";

import { useChatActions } from "../hooks/use-chat-actions";
import { perspectiveLabel } from "../lib/roles";
import { HeaderMenu } from "./header-menu";
import { InferenceBadge } from "./inference-badge";

/** Main-column width (rem) below which the action labels collapse to icons; matches `@max-[56rem]/main`. */
const ICON_ONLY_BELOW_REM = 56;

/**
 * True while the header is narrower than the icon-only threshold, so icon-only actions get a
 * tooltip. The labels themselves switch with a container query (no layout flash); this only
 * decides whether the tooltip may show.
 */
function useIconOnlyActions() {
  const ref = useRef<HTMLElement>(null);
  const [iconOnly, setIconOnly] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const width = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
      setIconOnly(width < ICON_ONLY_BELOW_REM * rem);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, iconOnly };
}

/** Surface tooltip that only shows while its button is icon-only (the tree stays the same either way). */
function ActionTooltip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip
      content={label}
      side="bottom"
      sideOffset={6}
      variant="surface"
      className={show ? undefined : "hidden"}
    >
      {children}
    </Tooltip>
  );
}

/** Header subtitle: the “ROLE” link before a system prompt is set, the perspective after. */
function HeaderSubtitle() {
  const systemPrompt = usePlaygroundPrefsStore(selectSystemPrompt);
  const perspective = perspectiveLabel(systemPrompt);

  if (perspective) {
    return (
      <p className="text-body-sm leading-tight text-subtle">
        Responses will be tailored to a{" "}
        <strong className="font-bold text-emphasis">{perspective}</strong> perspective for all the
        sessions.
      </p>
    );
  }

  return (
    <p className="text-body-sm leading-tight text-subtle">
      Click{" "}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) =>
          usePlaygroundUIStore.getState().openDialog("system-prompt", event.currentTarget)
        }
        className="rounded-xs font-semibold text-emphasis hover:underline"
      >
        “ROLE”
      </button>{" "}
      to define how the assistant should respond throughout this session.
    </p>
  );
}

/**
 * Playground page header (Figma: `1398:122057`, landing `1398:118807`, light `1520:47572`):
 * the page's only h1, the inference badge, the role subtitle and the Compare Models / Code / ⋮
 * actions. Responds to the `@container/main` column, so the History aside and sidebar count.
 */
export function PlaygroundHeader() {
  const mode = usePlaygroundChatStore(selectMode);
  const { enterCompare, exitCompare } = useChatActions();
  const { ref, iconOnly } = useIconOnlyActions();
  const comparing = mode === "compare";

  return (
    <header
      ref={ref}
      className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-field px-4 py-3 @min-[40rem]/main:min-h-21.25 @min-[40rem]/main:px-6 @min-[56rem]/main:flex-nowrap"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start gap-3">
          <h1 className="text-heading-lg leading-tight text-primary">Playground</h1>
          <InferenceBadge className="@max-[40rem]/main:hidden" />
        </div>
        <HeaderSubtitle />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ActionTooltip label="Compare Models" show={iconOnly}>
          <Button
            variant="ghost"
            iconSize={18}
            leftIcon="switch-horizontal"
            aria-pressed={comparing}
            onClick={comparing ? () => exitCompare("a") : enterCompare}
          >
            <span className="@max-[56rem]/main:sr-only">Compare Models</span>
          </Button>
        </ActionTooltip>
        <ActionTooltip label="Code" show={iconOnly}>
          <Button
            variant="cta"
            iconSize={18}
            leftIcon="code"
            aria-haspopup="dialog"
            onClick={(event) =>
              usePlaygroundUIStore.getState().openDialog("view-code", event.currentTarget)
            }
          >
            <span className="@max-[56rem]/main:sr-only">Code</span>
          </Button>
        </ActionTooltip>
        <HeaderMenu />
      </div>
    </header>
  );
}
