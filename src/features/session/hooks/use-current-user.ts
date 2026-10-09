"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { isApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useSessionStore } from "@/stores/session-store";

import { getCurrentUser } from "../api/session.api";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.session.me(),
    queryFn: ({ signal }) => getCurrentUser(signal),
  });
}

/** Mirrors the `/me` query into `useSessionStore`. A 401 means a guest. Mount once, in the app providers. */
export function useSessionSync() {
  const { data, error } = useCurrentUser();
  const setUser = useSessionStore((state) => state.setUser);
  const setGuest = useSessionStore((state) => state.setGuest);

  useEffect(() => {
    if (data) setUser(data);
    else if (isApiError(error) && error.status === 401) setGuest();
  }, [data, error, setUser, setGuest]);
}
