"use client";

import { Suspense } from "react";

import { selectHasTurns, selectMode, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { selectHistoryOpen, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";

import { CompareView } from "./compare-view";
import { Composer } from "./composer";
import { HistoryAside } from "./history-aside";
import { HistoryDrawer } from "./history-drawer";
import { ModelParamSync } from "./model-param-sync";
import { PlaygroundDialogs } from "./playground-dialogs";
import { PlaygroundHeader } from "./playground-header";
import { PlaygroundHero } from "./playground-hero";
import { SingleChat } from "./single-chat";

/**
 * The Playground screen (Figma: Playground `1398:118805`, Normal Chat `1398:122055`, Compare
 * `1398:119699`, History `1398:118993`): header and Chat area (hero, single chat or compare),
 * the History panel (in-flow ≥ lg, drawer below), the dialogs and the `?model=` deep link.
 * Fills <main>'s height; only the inner scrollers scroll.
 */
export function PlaygroundView() {
  const mode = usePlaygroundChatStore(selectMode);
  const hasTurns = usePlaygroundChatStore(selectHasTurns);
  const historyOpen = usePlaygroundPrefsStore(selectHistoryOpen);

  return (
    <div className="flex h-full min-h-0">
      <div className="@container/main flex min-w-0 flex-1 flex-col">
        <PlaygroundHeader />
        <section
          aria-label="Chat"
          data-history-open={historyOpen || undefined}
          className="group/chat @container relative flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {mode === "compare" ? (
            <CompareView />
          ) : hasTurns ? (
            <SingleChat />
          ) : (
            <PlaygroundHero composer={<Composer placement="hero" />} />
          )}
        </section>
      </div>
      <HistoryAside />
      <HistoryDrawer />
      <PlaygroundDialogs />
      <Suspense fallback={null}>
        <ModelParamSync />
      </Suspense>
    </div>
  );
}
