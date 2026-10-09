import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

/** localStorage key; the no-flash inline script in the root layout reads the same key. */
export const THEME_STORAGE_KEY = "sn:theme";

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated after mount by <StoreHydration /> to avoid SSR mismatches.
      skipHydration: true,
      partialize: ({ theme }) => ({ theme }),
    },
  ),
);

export const selectTheme = (state: ThemeState) => state.theme;
export const selectSetTheme = (state: ThemeState) => state.setTheme;
