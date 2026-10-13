"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";
import {
  selectHistoryOpen,
  selectPrefsHydrated,
  usePlaygroundPrefsStore,
} from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";

import { HistoryPanel } from "./history-panel";

/**
 * In-flow History panel for ≥ lg (Figma: History `1398:118993`): 290px column that slides open by
 * animating its width. The animation is gated on prefs hydration so it never plays on page load.
 */
export function HistoryAside() {
  const headingId = useId();
  const open = usePlaygroundPrefsStore(selectHistoryOpen);
  const hydrated = usePlaygroundPrefsStore(selectPrefsHydrated);

  const close = () => {
    usePlaygroundPrefsStore.getState().setHistoryOpen(false);
    const el = usePlaygroundUIStore.getState().returnFocusTo;
    if (el?.isConnected) el.focus();
  };

  return (
    <aside
      aria-labelledby={headingId}
      inert={!open}
      data-ready={hydrated || undefined}
      className={cn(
        "hidden h-full shrink-0 overflow-hidden border-l border-field bg-panel lg:flex",
        "duration-(--sn-duration-slow) ease-standard data-[ready]:transition-[width] motion-reduce:transition-none",
        open ? "w-72.5" : "w-0 border-l-0",
      )}
    >
      <div className="flex h-full w-72.5 shrink-0">
        <HistoryPanel onClose={close} headingId={headingId} />
      </div>
    </aside>
  );
}
