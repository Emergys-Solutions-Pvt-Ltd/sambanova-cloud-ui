"use client";

import { useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useAuthGate } from "@/features/auth";
import { selectHistoryOpen, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { type PlaygroundDialog, usePlaygroundUIStore } from "@/stores/playground-ui-store";

/** The in-flow History aside exists from `lg` up; below it History is a right drawer. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Header ⋮ menu (Figma: `1398:119661`, trigger `1907:146977`): Tuning Parameters, System Prompt
 * and View / Hide History. Dialogs and the History search return focus to the ⋮ trigger.
 */
export function HeaderMenu() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** Set by an item that moves focus elsewhere (dialog, History search), so the menu does not pull it back. */
  const focusHandedOff = useRef(false);
  const [desktop, setDesktop] = useState(false);

  const historyOpen = usePlaygroundPrefsStore(selectHistoryOpen);
  const { guardAction } = useAuthGate();

  const historyVisible = desktop && historyOpen;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      focusHandedOff.current = false;
      setDesktop(window.matchMedia(DESKTOP_QUERY).matches);
    }
  };

  const openDialog = (dialog: PlaygroundDialog) => {
    focusHandedOff.current = true;
    usePlaygroundUIStore.getState().openDialog(dialog, triggerRef.current);
  };

  const toggleHistory = () => {
    const prefs = usePlaygroundPrefsStore.getState();
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
    if (isDesktop && prefs.historyOpen) {
      // Hide History: focus stays on the trigger.
      prefs.setHistoryOpen(false);
      return;
    }
    const opener = triggerRef.current;
    focusHandedOff.current = true;
    guardAction(() => {
      const ui = usePlaygroundUIStore.getState();
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        usePlaygroundPrefsStore.getState().setHistoryOpen(true);
      } else {
        ui.setHistoryDrawerOpen(true);
      }
      ui.requestHistoryFocus(opener);
    })();
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <IconButton
          ref={triggerRef}
          icon="dots-vertical"
          size="md"
          variant="header"
          iconStrokeWidth={1.5}
          aria-label="More options"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        surface="flat"
        align="end"
        sideOffset={4}
        className="w-52.25"
        onCloseAutoFocus={(event) => {
          if (focusHandedOff.current) event.preventDefault();
        }}
      >
        <DropdownMenuItem variant="flat" onSelect={() => openDialog("tuning")}>
          <Icon name="adjustments-horizontal" size={18} className="mt-px" />
          Tuning Parameters
        </DropdownMenuItem>
        <DropdownMenuItem variant="flat" onSelect={() => openDialog("system-prompt")}>
          <Icon name="edit" size={18} className="mt-px" />
          System Prompt
        </DropdownMenuItem>
        <DropdownMenuItem variant="flat" onSelect={toggleHistory}>
          <Icon name="history" size={18} className="mt-px" />
          {historyVisible ? "Hide History" : "View History"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
