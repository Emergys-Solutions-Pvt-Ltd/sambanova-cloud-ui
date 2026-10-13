"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useActiveProject } from "@/features/projects";
import { type ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import {
  type Conversation,
  type ConversationSummary,
  type RenameConversationInput,
  type SaveConversationInput,
} from "@/types/domain";

import {
  deleteConversation,
  getConversation,
  listConversations,
  renameConversation,
  saveConversation,
} from "../api/playground.api";

// The list key is a prefix of every detail key, so list-only cache operations pass `exact: true`
// (a prefix cancel would abort a conversation being reopened).

interface ConversationTarget {
  projectId: string;
  id: string;
}

interface SaveConversationVariables extends ConversationTarget {
  input: SaveConversationInput;
}

interface RenameConversationVariables extends ConversationTarget {
  input: RenameConversationInput;
}

/** Cache state captured by an optimistic update, restored when the request fails. */
interface ConversationSnapshot {
  list: ConversationSummary[] | undefined;
  detail: Conversation | undefined;
}

/** History list of the active project (Playground history panel). Signed-in users only; newest first. */
export function useConversations() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  const projectId = useActiveProject().project?.id;

  return useQuery({
    queryKey: queryKeys.playground.conversations(projectId ?? ""),
    queryFn: ({ signal }) => listConversations(projectId!, signal),
    enabled: authenticated && Boolean(projectId),
    staleTime: 30_000,
  });
}

/** Query options for one saved conversation; use with `queryClient.fetchQuery` when reopening a chat. */
export function conversationQuery(projectId: string, id: string) {
  return queryOptions({
    queryKey: queryKeys.playground.conversation(projectId, id),
    queryFn: ({ signal }) => getConversation(projectId, id, signal),
  });
}

/** Saves (PUT upsert) a conversation and moves it to the top of the cached history list. */
export function useSaveConversation() {
  const queryClient = useQueryClient();

  return useMutation<Conversation, ApiError, SaveConversationVariables>({
    mutationFn: ({ projectId, id, input }) => saveConversation(projectId, id, input),
    onSuccess: (conversation, { projectId, id }) => {
      queryClient.setQueryData(queryKeys.playground.conversation(projectId, id), conversation);

      const listKey = queryKeys.playground.conversations(projectId);
      const summary: ConversationSummary = {
        id: conversation.id,
        title: conversation.title,
        mode: conversation.mode,
        updatedAt: conversation.updatedAt,
      };
      // Only patch a list that was already fetched: a one-item list would pass for the full history.
      queryClient.setQueryData<ConversationSummary[]>(listKey, (current) =>
        current ? [summary, ...current.filter((item) => item.id !== summary.id)] : current,
      );
      void queryClient.invalidateQueries({ queryKey: listKey, exact: true });
    },
  });
}

/**
 * Renames a conversation optimistically (history list and cached detail); rolls back on error.
 * The call site also updates the chat store title when the renamed chat is open.
 */
export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation<
    ConversationSummary,
    ApiError,
    RenameConversationVariables,
    ConversationSnapshot
  >({
    mutationFn: ({ projectId, id, input }) => renameConversation(projectId, id, input),
    onMutate: async ({ projectId, id, input }) => {
      const listKey = queryKeys.playground.conversations(projectId);
      const detailKey = queryKeys.playground.conversation(projectId, id);
      await queryClient.cancelQueries({ queryKey: listKey, exact: true });

      const snapshot: ConversationSnapshot = {
        list: queryClient.getQueryData<ConversationSummary[]>(listKey),
        detail: queryClient.getQueryData<Conversation>(detailKey),
      };
      queryClient.setQueryData<ConversationSummary[]>(listKey, (current) =>
        current?.map((item) => (item.id === id ? { ...item, title: input.title } : item)),
      );
      queryClient.setQueryData<Conversation>(detailKey, (current) =>
        current ? { ...current, title: input.title } : current,
      );
      return snapshot;
    },
    onError: (_error, { projectId, id }, snapshot) => {
      if (!snapshot) return;
      queryClient.setQueryData(queryKeys.playground.conversations(projectId), snapshot.list);
      queryClient.setQueryData(queryKeys.playground.conversation(projectId, id), snapshot.detail);
    },
    onSettled: (_data, _error, { projectId }) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.playground.conversations(projectId),
        exact: true,
      }),
  });
}

/** Deletes a conversation, removing it from the history list at once; rolls back on error. */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, ConversationTarget, ConversationSnapshot>({
    mutationFn: ({ projectId, id }) => deleteConversation(projectId, id),
    onMutate: async ({ projectId, id }) => {
      const listKey = queryKeys.playground.conversations(projectId);
      await queryClient.cancelQueries({ queryKey: listKey, exact: true });

      const snapshot: ConversationSnapshot = {
        list: queryClient.getQueryData<ConversationSummary[]>(listKey),
        detail: undefined,
      };
      queryClient.setQueryData<ConversationSummary[]>(listKey, (current) =>
        current?.filter((item) => item.id !== id),
      );
      return snapshot;
    },
    onError: (_error, { projectId }, snapshot) => {
      if (!snapshot) return;
      queryClient.setQueryData(queryKeys.playground.conversations(projectId), snapshot.list);
    },
    onSuccess: (_data, { projectId, id }) => {
      queryClient.removeQueries({
        queryKey: queryKeys.playground.conversation(projectId, id),
        exact: true,
      });
    },
    onSettled: (_data, _error, { projectId }) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.playground.conversations(projectId),
        exact: true,
      }),
  });
}
