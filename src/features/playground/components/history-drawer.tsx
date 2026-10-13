"use client";

import { useEffect, useId } from "react";

import { Drawer } from "@/components/ui/drawer";
import { usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { selectHistoryDrawerOpen, usePlaygroundUIStore } from "@/stores/playground-ui-store";

import { HistoryPanel } from "./history-panel";

/** Same breakpoint as Tailwind `lg`, where the in-flow aside takes over. */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * History as a right sheet below lg (Figma: History `1398:119056` in a Drawer). Growing the window
 * to lg closes the sheet and opens the in-flow aside instead.
 */
export function HistoryDrawer() {
  const headingId = useId();
  const open = usePlaygroundUIStore(selectHistoryDrawerOpen);
  const returnFocusTo = usePlaygroundUIStore((state) => state.returnFocusTo);
  const setOpen = usePlaygroundUIStore((state) => state.setHistoryDrawerOpen);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (!desktop.matches || !usePlaygroundUIStore.getState().historyDrawerOpen) return;
      usePlaygroundUIStore.getState().setHistoryDrawerOpen(false);
      usePlaygroundPrefsStore.getState().setHistoryOpen(true);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <Drawer
      side="right"
      size="panel"
      title="History"
      open={open}
      onOpenChange={setOpen}
      returnFocusTo={returnFocusTo}
    >
      <HistoryPanel onClose={() => setOpen(false)} headingId={headingId} />
    </Drawer>
  );
}
