import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProjectState {
  activeProjectId: string | null;
  setActiveProject: (projectId: string) => void;
  clearActiveProject: () => void;
}

/**
 * Active project selection. Only the id is stored; project data comes from
 * TanStack Query. Invalidate project-scoped queries with `useSwitchProject`
 * (features/projects) rather than calling `setActiveProject` directly.
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      clearActiveProject: () => set({ activeProjectId: null }),
    }),
    {
      name: "sn:project",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated after mount by <StoreHydration /> to avoid SSR mismatches.
      skipHydration: true,
      partialize: ({ activeProjectId }) => ({ activeProjectId }),
    },
  ),
);

export const selectActiveProjectId = (state: ProjectState) => state.activeProjectId;
export const selectSetActiveProject = (state: ProjectState) => state.setActiveProject;
