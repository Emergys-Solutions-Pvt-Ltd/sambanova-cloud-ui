"use client";

import { Icon } from "@/components/ui/icon/icon";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";

import { SUGGESTIONS } from "../lib/suggestions";

/** Puts the chip text into the composer and focuses it; never sends (decision A7). */
function applySuggestion(label: string) {
  const ui = usePlaygroundUIStore.getState();
  ui.setDraft(label);
  ui.requestComposerFocus();
}

/**
 * Hero suggestion chips (Figma: Component 57/58/59 `1398:122096/100/105`, light `1520:47619`):
 * pill with a halo icon disc and a 189px two-line label. Stacked until the Chat area is 640px.
 * Hover is the older suggestion-card ring (Figma `631:12973`).
 */
export function SuggestionChips() {
  return (
    <ul aria-label="Suggestions" className="grid w-full gap-3.5 @min-[40rem]:grid-cols-3">
      {SUGGESTIONS.map((suggestion) => (
        <li key={suggestion.label} className="flex">
          <button
            type="button"
            onClick={() => applySuggestion(suggestion.label)}
            className="group flex w-full items-start gap-3 rounded-full bg-prompt-chip p-3 text-left shadow-prompt-chip ring-1 ring-transparent backdrop-blur-prompt-chip transition-shadow duration-(--sn-duration-fast) ease-standard ring-inset hover:ring-brand-secondary/40 focus-visible:ring-focus motion-reduce:transition-none"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-icon-halo shadow-icon-halo">
              <Icon name={suggestion.icon} size={24} className="text-icon-accent" />
            </span>
            <span className="max-w-47.25 text-body leading-[19px] text-secondary">
              {suggestion.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
