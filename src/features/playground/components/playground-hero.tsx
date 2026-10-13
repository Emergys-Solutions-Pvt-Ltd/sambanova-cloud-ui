import { type ReactNode } from "react";

import { HeroBackdrop } from "./hero-backdrop";
import { SuggestionChips } from "./suggestion-chips";

/**
 * Empty-thread hero of the Chat area (Figma: Normal Chat `1398:122055`, landing `1398:118805`,
 * light `1520:47597`): backdrop art, gradient title, subtitle, the composer passed in by the view
 * and the suggestion chips, centred in the remaining height and scrollable when it is short.
 */
export function PlaygroundHero({ composer }: { composer: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-chat-hero">
      <HeroBackdrop />
      {/* The backdrop stays outside the scroller so it always covers the visible area. */}
      <div className="relative flex min-h-0 flex-1 scrollbar-thin flex-col overflow-y-auto">
        <div className="flex shrink-0 grow items-center justify-center px-4 py-8 md:px-6">
          <div className="flex w-full max-w-216 flex-col gap-7.5">
            <div className="flex flex-col items-center gap-10 md:gap-14">
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="inline-block text-playground-title text-heading-xl font-semibold sm:text-display">
                  Start Exploring With AI
                </h2>
                <p className="text-body-lg leading-tight tracking-snug text-hero-subtitle">
                  Test ideas, compare models, and uncover insights through intelligent
                  conversations.
                </p>
              </div>
              {/* Figma: the 860px composer sits 2px inside the 864px block. */}
              <div className="w-full px-0.5">{composer}</div>
            </div>
            <SuggestionChips />
          </div>
        </div>
      </div>
    </div>
  );
}
