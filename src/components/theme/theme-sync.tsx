"use client";

import { useEffect } from "react";

import { env } from "@/config/env";
import { applyTheme, watchSystemTheme } from "@/lib/theme";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Keeps <html data-theme> in sync with `useThemeStore` and, in "system" mode,
 * with the OS setting. Waits for the persisted store to rehydrate so the
 * default ("dark") never overrides what the inline head script applied. With the
 * switcher off (NEXT_PUBLIC_ENABLE_THEME_SWITCHER) it only keeps the app on dark.
 */
export function ThemeSync() {
  useEffect(() => {
    // Switcher off: the app is locked to dark, nothing to follow (the saved choice stays in storage).
    if (!env.themeSwitcher) {
      applyTheme("dark");
      return;
    }

    let stopWatching: (() => void) | undefined;

    const sync = (theme = useThemeStore.getState().theme) => {
      applyTheme(theme);
      stopWatching?.();
      stopWatching = theme === "system" ? watchSystemTheme(() => applyTheme("system")) : undefined;
    };

    const start = () => {
      sync();
      return useThemeStore.subscribe((state, previous) => {
        if (state.theme !== previous.theme) sync(state.theme);
      });
    };

    let unsubscribe: (() => void) | undefined;
    if (useThemeStore.persist.hasHydrated()) {
      unsubscribe = start();
    } else {
      const stopHydrationListener = useThemeStore.persist.onFinishHydration(() => {
        stopHydrationListener();
        unsubscribe = start();
      });
      unsubscribe = stopHydrationListener;
    }

    return () => {
      unsubscribe?.();
      stopWatching?.();
    };
  }, []);

  return null;
}
