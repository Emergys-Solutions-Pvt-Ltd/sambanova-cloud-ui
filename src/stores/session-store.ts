import { create } from "zustand";

import { type User } from "@/types/domain";

export type SessionStatus = "loading" | "authenticated" | "guest";

interface SessionState {
  status: SessionStatus;
  user: User | null;
  setUser: (user: User) => void;
  setGuest: () => void;
  /** Stub: clears the local session. Auth0 logout replaces this later. */
  logout: () => void;
}

/**
 * Who is signed in. Populated from the `/me` query by `useSessionSync`
 * (features/session); not persisted, so it is always fresh from the API.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  status: "loading",
  user: null,
  setUser: (user) => set({ status: "authenticated", user }),
  setGuest: () => set({ status: "guest", user: null }),
  logout: () => set({ status: "guest", user: null }),
}));

export const selectSessionStatus = (state: SessionState) => state.status;
export const selectUser = (state: SessionState) => state.user;
export const selectCreditBalance = (state: SessionState) => state.user?.creditBalance ?? null;
export const selectIsAuthenticated = (state: SessionState) => state.status === "authenticated";
