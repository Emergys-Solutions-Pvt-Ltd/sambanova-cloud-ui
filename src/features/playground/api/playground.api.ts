import { apiClient } from "@/lib/api";
import {
  type Conversation,
  type ConversationSummary,
  type RenameConversationInput,
  type SaveConversationInput,
} from "@/types/domain";

const base = (projectId: string) =>
  `/projects/${encodeURIComponent(projectId)}/playground/conversations`;

const item = (projectId: string, id: string) => `${base(projectId)}/${encodeURIComponent(id)}`;

/** Saved Playground conversations of a project, newest first. */
export async function listConversations(
  projectId: string,
  signal?: AbortSignal,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<ConversationSummary[]>(base(projectId), { signal });
  return data;
}

/** One saved conversation with every turn. */
export async function getConversation(
  projectId: string,
  id: string,
  signal?: AbortSignal,
): Promise<Conversation> {
  const { data } = await apiClient.get<Conversation>(item(projectId, id), { signal });
  return data;
}

/** Creates or replaces a conversation (PUT upsert). */
export async function saveConversation(
  projectId: string,
  id: string,
  input: SaveConversationInput,
): Promise<Conversation> {
  const { data } = await apiClient.put<Conversation>(item(projectId, id), input, {
    skipRetry: true,
  });
  return data;
}

/** Renames a conversation. */
export async function renameConversation(
  projectId: string,
  id: string,
  input: RenameConversationInput,
): Promise<ConversationSummary> {
  const { data } = await apiClient.patch<ConversationSummary>(item(projectId, id), input, {
    skipRetry: true,
  });
  return data;
}

/** Deletes a conversation (204). */
export async function deleteConversation(projectId: string, id: string): Promise<void> {
  await apiClient.delete(item(projectId, id), { skipRetry: true });
}
