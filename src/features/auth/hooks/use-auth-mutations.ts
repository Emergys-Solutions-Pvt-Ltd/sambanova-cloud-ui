"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { useProjectStore } from "@/stores/project-store";
import { useSessionStore } from "@/stores/session-store";
import { type AuthResponse } from "@/types/domain";

import { login, logout, signup } from "../api/auth.api";

/** Drops everything that belonged to the previous visitor (projects, usage, ...). Public data stays. */
export function useResetUserData() {
  const queryClient = useQueryClient();

  return () => {
    useProjectStore.getState().clearActiveProject();
    queryClient.removeQueries({ queryKey: queryKeys.projects.all });
    queryClient.removeQueries({ queryKey: ["project"] });
  };
}

function useStartSession() {
  const queryClient = useQueryClient();
  const resetUserData = useResetUserData();

  return ({ user }: AuthResponse) => {
    resetUserData();
    // The cookie is already set; seed `/me` so the session store updates without another round trip.
    queryClient.setQueryData(queryKeys.session.me(), user);
    useSessionStore.getState().setUser(user);
  };
}

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({ mutationFn: login, onSuccess: startSession });
}

export function useSignup() {
  const startSession = useStartSession();
  return useMutation({ mutationFn: signup, onSuccess: startSession });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const resetUserData = useResetUserData();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      useSessionStore.getState().logout();
      resetUserData();
      // `/me` must not keep returning the old user from cache.
      queryClient.removeQueries({ queryKey: queryKeys.session.me() });
    },
  });
}
