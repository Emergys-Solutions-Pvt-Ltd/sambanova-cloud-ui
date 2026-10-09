import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  onboardingStepsHidden: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setOnboardingStepsHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      onboardingStepsHidden: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setOnboardingStepsHidden: (onboardingStepsHidden) => set({ onboardingStepsHidden }),
    }),
    {
      name: "sn:ui",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated after mount by <StoreHydration /> to avoid SSR mismatches.
      skipHydration: true,
      // The mobile drawer is transient and must always start closed.
      partialize: ({ sidebarCollapsed, onboardingStepsHidden }) => ({
        sidebarCollapsed,
        onboardingStepsHidden,
      }),
    },
  ),
);

export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectMobileNavOpen = (state: UIState) => state.mobileNavOpen;
export const selectOnboardingStepsHidden = (state: UIState) => state.onboardingStepsHidden;
